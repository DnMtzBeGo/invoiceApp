import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, Observable, of, Subject, BehaviorSubject, timer, merge, from, fromEvent, interval } from 'rxjs';
import { mergeAll, tap, filter, startWith, mapTo, exhaustMap, takeUntil, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';
import { HeaderService } from 'src/app/pages/home/services/header.service';
import { ofType } from 'src/app/shared/utils/operators.rx';
import { CustomMarker } from 'src/app/pages/home/custom.marker';
import { Location } from '@angular/common';

declare var google: any;
// 10 seconds for refreshing map markers
const markersRefreshTime = 1000 * 20;

@Component({
  selector: 'app-fleet-page',
  templateUrl: './fleet-page.component.html',
  styleUrls: ['./fleet-page.component.scss']
})
export class FleetPageComponent implements OnInit {
  showOrderDetails: boolean = false;

  // members map logic
  geocoder = new google.maps.Geocoder();
  mapEmitter = new Subject<['startReload' | 'center' | 'hideFleetMap']>();
  map: any;
  googleMarkers: any[] = [];
  isMapDirty = false;
  bounds: any;
  start: any;
  end: any;
  zoom = 18;
  maxZoom = 18;
  markersArray = [];
  userRole: any;
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
  markersFromService: Array<any> = new Array();
  showFleetMap = false;

  @ViewChild('map', { read: ElementRef, static: false }) mapRef!: ElementRef;

  subs = new Subscription();
  showCompleteModal = false;

  constructor(
    private router: Router,
    private webService: AuthService,
    private googlemaps: GoogleMapsService,
    private headerStyle: HeaderService,
    private elementRef: ElementRef,
    private location: Location
  ) {
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
          filter(() => this.showFleetMap),
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
              )
            )
          )
        )
      ).subscribe(this.getFleetDetails.bind(this))
    );
  }

  ngOnDestroy(): void {
    this.headerStyle.changeHeader(false);
    this.subs.unsubscribe();
  }

  private async getFleetDetails(cleanRefresh: boolean) {
    (
      await this.webService.apiRest('', 'carriers/home', {
        loader: cleanRefresh ? 'false' : 'true'
      })
    )
      .pipe(catchError(() => of({})))
      .subscribe((res) => {
        if (res.status === 200 && res.result) {
          // When members exist on the fleet, it saves them on this array
          this.markersFromService = [];
          res.result.members.forEach((row) => {
            if (row.location) {
              this.markersFromService.push({
                title: row._id,
                position: {
                  lat: row.location.lat,
                  lng: row.location.lng
                },
                icon: row.thumbnail,
                state: !row.connected
                  ? 'inactive'
                  : row.availability === 1
                  ? 'available'
                  : row.availability === 2
                  ? 'unavailable'
                  : 'unavailable'
              });
            }
          });
        }

        // this.getDriverRole(cleanRefresh);
        let userRole = res.result.role;
        this.userRole = userRole;

        // this.broadcastRoleService.emit({
        //   role: res.result.role,
        //   fleet: this.fleetCreated
        // });

        if (userRole && this.markersFromService.length > 0) {
          this.initMap(cleanRefresh);
          this.showFleetMap = true;
        } else {
          this.showFleetMap = false;
          // this.showMap(cleanRefresh);
        }

        if (userRole && userRole !== 1) this.mapEmitter.next(['startReload']);
      });
  }

  // showMap(cleanRefresh: boolean) {
  //   // Obtener la ubicación del dispositivo
  //   navigator.geolocation.getCurrentPosition(
  //     (resp) => {
  //       this.start = new google.maps.LatLng(
  //         resp.coords.latitude,
  //         resp.coords.longitude
  //       );

  //       let mapOptions = {
  //         center: this.start,
  //         zoom: this.zoom,
  //         scrollwheel: false,
  //         disableDoubleClickZoom: true,
  //         mapId: "893ce2d924d01422",
  //         disableDefaultUI: true,
  //         backgroundColor: '#040b12',
  //         keyboardShortcuts: false
  //       };

  //       this.geocoder.geocode({ location: this.start }, (result, status) => {
  //         if (status === 'OK') {
  //           result = result[0];
  //           this.startAddress = result.formatted_address;
  //         }
  //       });

  //       // Create map
  //       if (this.map == void 0)
  //         window.requestAnimationFrame(() => {
  //           this.map.addListener('dblclick', () => {
  //             this.zoom += 1;
  //             this.map.setZoom(this.zoom);
  //           });

  //           this.elementRef.nativeElement
  //             .querySelector('.google-map')
  //             .addEventListener(
  //               'mousewheel',
  //               (event) => {
  //                 if (event.deltaY > 1) this.zoom += -1;
  //                 else this.zoom += 1;
  //                 this.map.setZoom(this.zoom);
  //               },
  //               true
  //             );

  //           this.makeMarker(this.start, this.icons.location, 'location');
  //           this.map.fromShowMap = true;
  //         });

  //       this.map =
  //         this.map ||
  //         new google.maps.Map(this.mapRef.nativeElement, mapOptions);
  //       this.bounds = new google.maps.LatLngBounds();

  //       if (cleanRefresh === false) this.map.setCenter(this.start);
  //     },
  //     (error) => {
  //       console.log('Error getting location', error);
  //     }
  //   )
  // }

  makeMarker(position, icon, title) {
    this.bounds.extend(position);
    this.markersArray.push(
      new google.maps.Marker({
        position,
        map: this.map,
        icon,
        title
      })
    );
  }

  initMap(cleanRefresh: boolean) {
    // console.log('- initMap(' + cleanRefresh + ') - (' + this.isMapDirty + ')');

    // Create map
    if (this.map == void 0) {
      window.requestAnimationFrame(() => {
        google.maps.event.addListener(this.map, 'drag', () => {
          this.isMapDirty = true;
        });

        google.maps.event.addListener(this.map, 'dblclick', () => {
          if (this.map.getZoom() + 1 <= this.maxZoom) {
            this.isMapDirty = true;
          }
          // console.log('zoom:', this.zoom);
        });

        this.mapRef.nativeElement.addEventListener(
          'mousewheel',
          (event) => {
            // zoom in
            if (this.map.getZoom() + 1 <= this.maxZoom && !(event.deltaY > 1)) {
              this.isMapDirty = true;
            }
            // zoom out
            else if (event.deltaY > 1) {
              this.isMapDirty = true;
            }
          },
          true
        );
      });
    }

    const fromShowMap = this.map && this.map.fromShowMap === true;
    this.map =
      this.map != void 0 && !fromShowMap
        ? this.map
        : new google.maps.Map(this.mapRef.nativeElement, {
            zoom: this.zoom,
            maxZoom: this.maxZoom,
            mapId: '893ce2d924d01422',
            disableDefaultUI: true,
            backgroundColor: '#040b12',
            keyboardShortcuts: false,
            center: {
              lat: this.markersFromService[0].position.lat,
              lng: this.markersFromService[0].position.lng
            }
          });

    // clean bounds, googleMarkers
    this.bounds = new google.maps.LatLngBounds();
    this.googleMarkers.forEach((marker) => {
      marker.setMap(null);
      marker.remove();
    });
    this.googleMarkers = [];

    for (var i = 0; i < this.markersFromService.length; i++) {
      let changePic = this.markersFromService[i].icon.split('');
      if (changePic[changePic.length - 1] === '/') this.markersFromService[i].icon = '../assets/images/user-outline.svg';

      const marker = new CustomMarker(
        new google.maps.LatLng(this.markersFromService[i].position.lat, this.markersFromService[i].position.lng),
        this.map,
        this.markersFromService[i].icon,
        this.markersFromService[i].state,
        this.markersFromService[i].title
      );

      this.googleMarkers.push(marker);
      this.bounds.extend(marker.getPosition());
    }

    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      // this.map.setOptions({ maxZoom: null });
      this.zoom = this.map.getZoom();
    });

    if (cleanRefresh === false || fromShowMap || this.isMapDirty === false)
      this.map.fitBounds(this.bounds, { bottom: 50, top: 50, left: 80, right: 50 + 400 + 50 });
  }
}
