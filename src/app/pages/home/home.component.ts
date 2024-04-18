import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, of, Subject, merge, fromEvent, interval } from 'rxjs';
import { tap, filter, mapTo, exhaustMap, takeUntil, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PlacesService } from 'src/app/shared/services/places.service';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';
import { HeaderService } from './services/header.service';
import { ofType } from 'src/app/shared/utils/operators.rx';
import { CustomMarker } from './custom.marker';
import { OrderPreview } from '../orders/orders.component';
import { Location } from '@angular/common';
import { PolygonFilter } from './components/polygon-filter/polygon-filter.component';
import { InputDirectionsComponent } from 'src/app/shared/components/input-directions/input-directions.component';
import { trigger, style, animate, transition } from '@angular/animations';
import { PrimeService } from 'src/app/shared/services/prime.service';


declare var google: any;
// 10 seconds for refreshing map markers
const markersRefreshTime = 1000 * 20;
const baseRadius = 25000;
const zoomFactor = 2000;
const minRadius = 500;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('slideInFromBottom', [
      transition('void => *', [
        style({ transform: 'translateY(100%)' }),
        animate('500ms ease-out')
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild(PolygonFilter) polygonFilter: PolygonFilter;
  @ViewChild(InputDirectionsComponent) inputDirections: InputDirectionsComponent;
  mostrarBoton = false;
  @Input() locations: GoogleLocation = {
    pickup: '',
    dropoff: '',
    pickupLat: '',
    pickupLng: '',
    dropoffLat: '',
    dropoffLng: '',
    pickupPostalCode: 0,
    dropoffPostalCode: 0
  };
  datepickup: number;
  datedropoff: number;
  draftData: any;
  orderPreview: OrderPreview;
  headerTransparent: boolean = true;
  showOrderDetails: boolean = false;

  orderType = 'FTL';

  public typeMap: string = 'home';
  public imageFromGoogle: any;
  public membersToAssigned: object = {};
  public userWantCP: boolean = false;
  public haveNotFleetMembers: boolean = false;
  public haveFleetMembersErrors: Array<string> = [];

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

  showSidebar = true;
  showCompleteModal = false;

  isPrime = false;

  constructor(
    private router: Router,
    private webService: AuthService,
    public placesService: PlacesService,
    private googlemaps: GoogleMapsService,
    private headerStyle: HeaderService,
    private location: Location,
    public primeService: PrimeService
  ) {
    this.placesService.places$;
    this.headerStyle.changeHeader(this.headerTransparent);
    this.subs.add(
      this.router.events.subscribe((res) => {
        if (res instanceof NavigationEnd && res.url.startsWith('/home')) {
          const data = this.router.getCurrentNavigation()?.extras.state;

          if (data?.showCompleteModal) {
            this.showCompleteModal = data.showCompleteModal;
            this.location.replaceState('');
          }

          if (data && data.hasOwnProperty('draft')) {
            this.draftData = data.draft;
            this.locations.pickup = data.draft.pickup.address;
            this.locations.dropoff = data.draft.dropoff.address;
            this.locations.pickupLat = data.draft.pickup.lat;
            this.locations.pickupLng = data.draft.pickup.lng;
            this.locations.dropoffLat = data.draft.dropoff.lat;
            this.locations.dropoffLng = data.draft.dropoff.lng;
            this.locations.pickupPostalCode = data.draft.pickup.zip_code;
            this.locations.dropoffPostalCode = data.draft.dropoff.zip_code;
            this.locations.place_id_pickup = data.draft.pickup.place_id_pickup;
            this.locations.place_id_dropoff = data.draft.dropoff.place_id_dropoff;
            this.typeMap = 'draft';
            window.requestAnimationFrame(() => this.googlemaps.updateDataLocations(this.locations));
            /* this.showNewOrderCard(); */
          } else {
            window.requestAnimationFrame(() => this.mapEmitter.next(['center']));
          }
        }
      })
    );
  }

  ngOnInit(): void {

    setTimeout(() => {
      this.mostrarBoton = true;
    }, 8000);
    // this.showNewOrderCard();

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
      )
        .pipe(filter(() => !this.creatingForms))
        .subscribe(this.getFleetDetails.bind(this))
    );

    if (this.primeService.loaded.isStopped) {
      this.isPrime = this.primeService.isPrime;
    } else {
      this.primeService.loaded.subscribe(() => {
        this.isPrime = this.primeService.isPrime;
      })
    }
  }

  ngOnDestroy(): void {
    this.headerStyle.changeHeader(false);
    this.subs.unsubscribe();
  }

  async createDraft() {
    const draftPayload = {
      destinations: [
        {
          type: 'pickup',
          location: await this.getLocationId(this.locations.place_id_pickup)
        },
        {
          type: 'dropoff',
          location: await this.getLocationId(this.locations.place_id_dropoff)
        }
      ],
      stamp: this.userWantCP,
      type: this.orderType,
      target: 'carriers',
      origin: 'web'
    };

    const req = await this.webService.apiRest(JSON.stringify(draftPayload), 'orders/create_draft', { apiVersion: 'v1.1' });
    const { result } = await req.toPromise();

    this.orderPreview = result;
  }

  async showNewOrderCard() {
    await this.createDraft();
    this.showOrderDetails = true;
  }

  private async getLocationId(place_id: string): Promise<string> {
    const payload = { place_id };

    const req = await this.webService.apiRestPut(JSON.stringify(payload), 'orders/locations', { apiVersion: 'v1.1', loader: false });

    const res = await req.toPromise();
    return res.result._id;
  }

  updateLocation() {
    if (this.creatingForms) {
      this.clearMap();
      this.polygonFilter.clearFilters();
      this.creatingForms = false;
    }
  }

  updateLocations(data: GoogleLocation) {
    this.locations = data;
    this.showFleetMap = false;
    this.mapEmitter.next(['hideFleetMap']);
  }

  updateDatepickup(data: number) {
    this.datepickup = data;
  }

  updateDropOffDate(data: number) {
    this.datedropoff = data;
  }

  getGoogleImageMap(data: any) {
    this.imageFromGoogle = data;
  }

  public getMembersToAssignedOrder(event: Event) {
    this.membersToAssigned = { ...event };
  }

  public getUserWantCP(event: boolean) {
    this.userWantCP = event;
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
          this.isPrime = res.result.subscription

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

          this.haveNotFleetMembers = !res.result.trailers || !res.result.trucks;

          if (res.result.hasOwnProperty('errors') && res.result.errors.length > 0) {
            this.haveFleetMembersErrors = res.result.errors;
          }
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

        google.maps.event.addListener(this.map, 'zoom_changed', () => {
          this.circles.forEach((circle) => {
            circle.setRadius(this.calculateCircleRadius(this.map.getZoom()));
          });
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

  onStepChange(step: number) {
    this.showSidebar = !this.showOrderDetails || step < 3;
  }

  creatingForms: boolean = false;
  openOrderMenu: boolean = false;
  heatmap: any;
  centerCoords: any;
  polygons: any = [];
  circles: any = [];

  getCoordinates({ type, geometry, locations, members }: any) {
    if (this.inputDirections.autocompleteDropoff.input || this.inputDirections.autocompletePickup.input) {
      this.showFleetMap = true;
      this.inputDirections.ClearAutocompleteDropoff();
      this.inputDirections.ClearAutocompletePickup();
    }

    this.centerCoords = { type, geometry, locations, members };
    this.creatingForms = true;
    this.clearMap();
    if (type === 'heatmap') this.addHeatmap(locations);
    else this.addDispersion(members);
    this.createPolygons(geometry.features);
    this.openOrderMenu = false;
  }

  addHeatmap(heatmapData) {
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: this.coordinatesToLatLng(heatmapData),
      dissipating: false,
      map: this.map,
      radius: 0.3
    });
  }

  createPolygons(geometry) {
    if (!geometry?.length) return;

    const bounds = new google.maps.LatLngBounds();

    geometry.forEach((polygon) => {
      const coordinates = polygon.geometry.coordinates[0].map((coord) => {
        return { lat: coord[1], lng: coord[0] };
      });

      const newPolygon = new google.maps.Polygon({
        paths: coordinates,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        strokeColor: '#FFEE00',
        fillColor: '#FFEE00',
        fillOpacity: 0.2,
        editable: false,
        draggable: false
      });

      newPolygon.setMap(this.map);
      this.polygons.push(newPolygon);

      coordinates.forEach((coordinate) => {
        bounds.extend(coordinate);

        const circle = new google.maps.Circle({
          strokeColor: '#FFEE00',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FFEE00',
          fillOpacity: 1,
          map: this.map,
          center: coordinate,
          radius: this.calculateCircleRadius(this.map.getZoom())
        });

        this.circles.push(circle);
      });

      this.map.fitBounds(bounds);
    });
  }

  addDispersion(members) {
    if (!members?.length) return;

    members.forEach((member) => {
      if (member.location) {
        this.markersFromService.push({
          title: member.nickname,
          extraData: member.email,
          position: {
            lat: member.location.lat,
            lng: member.location.lng
          },
          icon: member.thumbnail
        });
      }
    });

    this.googleMarkers = [];

    for (var i = 0; i < this.markersFromService.length; i++) {
      let changePic = this.markersFromService[i].icon.split('');
      if (changePic[changePic.length - 1] === '/') this.markersFromService[i].icon = '../assets/images/user-outline.svg';

      const marker = new CustomMarker(
        new google.maps.LatLng(this.markersFromService[i].position.lat, this.markersFromService[i].position.lng),
        this.map,
        this.markersFromService[i].icon,
        null,
        this.markersFromService[i].title,
        true,
        this.markersFromService[i].extraData
      );

      this.googleMarkers.push(marker);
    }
  }

  clearMap(): void {
    this.googleMarkers?.forEach((marker) => {
      marker.setMap(null);
      marker.remove();
    });

    this.markersFromService = [];
    this.googleMarkers = [];

    if (this.heatmap) this.heatmap.setMap(null);

    if (this.polygons) {
      this.polygons.forEach((polygon) => {
        polygon.setMap(null);
      });
    }

    if (this.circles) {
      this.circles.forEach((circle) => {
        circle.setMap(null);
      });
      this.circles = []; // Limpiar el array de referencias a los círculos
    }

    this.openOrderMenu = true;
  }

  coordinatesToLatLng(data: any[]): any[] {
    return data.map((coord) => new google.maps.LatLng(coord.lat, coord.lng));
  }

  clearedFilter() {
    if (!this.creatingForms && (this.inputDirections.autocompleteDropoff.input || this.inputDirections.autocompletePickup.input)) return;
    this.clearMap();
    this.creatingForms = false;
    this.getFleetDetails(false);
  }

  calculateCircleRadius(zoomLevel: number): number {
    let radius = baseRadius - zoomFactor * zoomLevel;
    return Math.max(radius, minRadius);
  }

  trafficLayer: google.maps.TrafficLayer;
  isTrafficActive: boolean = false;

  toggleTraffic() {
    this.isTrafficActive = !this.isTrafficActive;

    const btnTraffic = document.querySelector('.btn-traffic');

    if (this.isTrafficActive) {
      btnTraffic.classList.add('active');
    } else {
      btnTraffic.classList.remove('active');
    }
  
    const map = this.map;
  
    if (this.isTrafficActive) {
      if (map) {
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
      
        this.trafficLayer = trafficLayer;
      }
    } else {
      if (this.trafficLayer) {
        this.trafficLayer.setMap(null);
        this.trafficLayer = null;
      }
    }
  }
}
