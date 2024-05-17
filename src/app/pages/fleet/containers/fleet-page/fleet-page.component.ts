import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, Subject, merge, fromEvent, interval } from 'rxjs';
import { tap, filter, mapTo, exhaustMap, takeUntil } from 'rxjs/operators';
import { HeaderService } from 'src/app/pages/home/services/header.service';
import { ofType } from 'src/app/shared/utils/operators.rx';
import { Location } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { MapDashboardService } from 'src/app/pages/map-dashboard/map-dashboard.service';

declare var google: any;
// 10 seconds for refreshing map markers
const markersRefreshTime = 1000 * 20;

@Component({
  selector: 'app-fleet-page',
  templateUrl: './fleet-page.component.html',
  styleUrls: ['./fleet-page.component.scss'],
  animations: [
    trigger('slideInFromBottom', [transition('void => *', [style({ transform: 'translateY(100%)' }), animate('500ms ease-out')])])
  ]
})
export class FleetPageComponent implements OnInit {
  // members map logic
  geocoder = new google.maps.Geocoder();
  mapEmitter = new Subject<['startReload' | 'center' | 'hideFleetMap']>();
  googleMarkers: any[] = [];
  isMapDirty = false;
  bounds: any;
  start: any;
  end: any;
  zoom = 18;
  maxZoom = 18;
  markersArray = [];
  startAddress: string;
  icons = {
    location: new google.maps.MarkerImage(
      '../assets/map/location.svg',
      new google.maps.Size(68, 68),
      new google.maps.Point(0, 0),
      new google.maps.Point(34, 34)
    ),
    pin: new google.maps.MarkerImage(
      '../assets/map/pin.svg',
      new google.maps.Size(17, 40),
      new google.maps.Point(0, 0),
      new google.maps.Point(7.5, 20)
    )
  };

  subs = new Subscription();
  showCompleteModal = false;

  showTrafficButton: boolean;

  constructor(
    private router: Router,
    private headerStyle: HeaderService,
    private location: Location,
    public mapDashboardService: MapDashboardService
  ) {
    window.requestAnimationFrame(() => this.mapEmitter.next(['center']));

    this.subs.add(
      this.router.events.subscribe((res) => {
        if (res instanceof NavigationEnd && res.url === '/fleet') {
          window.requestAnimationFrame(() => this.mapEmitter.next(['center']));

          const data = this.router.getCurrentNavigation()?.extras.state;

          if (data?.showCompleteModal) {
            this.showCompleteModal = data.showCompleteModal;
            this.location.replaceState('/fleet');
          }
        }
      })
    );

    this.mapDashboardService.startReload.subscribe(() => this.mapEmitter.next(['startReload']));
  }

  ngOnInit(): void {
    this.headerStyle.changeHeader(true);

    // Set the name of the hidden property and the change event for visibility
    let visibilityChange;
    if (typeof (document as any).hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      visibilityChange = 'visibilitychange';
    } else if (typeof (document as any).msHidden !== 'undefined') {
      visibilityChange = 'msvisibilitychange';
    } else if (typeof (document as any).webkitHidden !== 'undefined') {
      visibilityChange = 'webkitvisibilitychange';
    }

    const pauseApp$ = fromEvent(document, visibilityChange).pipe(filter(() => document.visibilityState === 'hidden'));
    const resumeApp$ = fromEvent(document, visibilityChange).pipe(filter(() => document.visibilityState === 'visible'));

    this.subs.add(
      merge(
        this.mapEmitter.pipe(ofType('center'), mapTo(false)),
        resumeApp$.pipe(
          filter(() => this.mapDashboardService.showFleetMap),
          mapTo(false)
        ),
        this.mapEmitter.pipe(
          ofType('startReload'),
          exhaustMap(() =>
            interval(markersRefreshTime).pipe(
              mapTo(true),
              takeUntil(
                merge(
                  pauseApp$,
                  this.mapEmitter.pipe(ofType('hideFleetMap')),
                  this.mapEmitter.pipe(
                    ofType('center'),
                    tap(() => {
                      this.isMapDirty = false;
                    })
                  )
                )
              ),
            )
          )
        )
      ).subscribe((cleanRefresh) => {
        this.mapDashboardService.getFleetDetails.next(cleanRefresh);
      })
    );
  }

  makeMarker(position, icon, title) {
    this.mapDashboardService.makeMarker.next({ position, icon, title });
  }

  ngOnDestroy(): void {
    this.headerStyle.changeHeader(false);
    this.subs.unsubscribe();
  }

  trafficLayer: google.maps.TrafficLayer;
  isTrafficActive: boolean = false;
}
