import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderService } from 'src/app/pages/home/services/header.service';
import { Location } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';
import { MapDashboardService } from 'src/app/pages/map-dashboard/map-dashboard.service';

declare var google: any;

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

  constructor(
    private router: Router,
    private headerStyle: HeaderService,
    private location: Location,
    public mapDashboardService: MapDashboardService
  ) {
    this.subs.add(
      this.router.events.subscribe((res) => {
        if (res instanceof NavigationEnd && res.url === '/fleet') {
          window.requestAnimationFrame(() => this.updateMap());

          const data = this.router.getCurrentNavigation()?.extras.state;

          if (data?.showCompleteModal) {
            this.showCompleteModal = data.showCompleteModal;
            this.location.replaceState('/fleet');
          }
        }
      })
    );
  }

  ngOnInit(): void {
    this.headerStyle.changeHeader(true);
  }

  ngOnDestroy(): void {
    this.headerStyle.changeHeader(false);
    this.subs.unsubscribe();
  }

  updateMap() {
    this.isMapDirty = true;
    this.mapDashboardService.getFleetDetails.next(false);
  }

  makeMarker(position: any, icon: any, title: any) {
    this.mapDashboardService.makeMarker.next({ position, icon, title });
  }
}
