import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, Subject, merge, fromEvent, interval } from 'rxjs';
import { tap, filter, mapTo, exhaustMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PlacesService } from 'src/app/shared/services/places.service';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';
import { HeaderService } from './services/header.service';
import { ofType } from 'src/app/shared/utils/operators.rx';
import { OrderPreview } from '../orders/orders.component';
import { Location } from '@angular/common';
import { PolygonFilter } from './components/polygon-filter/polygon-filter.component';
import { InputDirectionsComponent } from 'src/app/shared/components/input-directions/input-directions.component';
import { trigger, style, animate, transition } from '@angular/animations';
import { PrimeService } from 'src/app/shared/services/prime.service';
import { LocationsService } from '../../services/locations.service';
import { MapDashboardService } from '../map-dashboard/map-dashboard.service';

declare var google: any;
// 10 seconds for refreshing map markers
const markersRefreshTime = 1000 * 20;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('slideInFromBottom', [transition('void => *', [style({ transform: 'translateY(100%)' }), animate('500ms ease-out')])])
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
  googleMarkers: any[] = [];
  isMapDirty = false;
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

  showSidebar = true;
  showCompleteModal = false;

  isPrime = false;
  showTrafficButton: boolean;

  constructor(
    private router: Router,
    private webService: AuthService,
    public placesService: PlacesService,
    private googlemaps: GoogleMapsService,
    private headerStyle: HeaderService,
    private location: Location,
    public primeService: PrimeService,
    private locationsService: LocationsService,
    public mapDashboardService: MapDashboardService
  ) {
    this.headerStyle.changeHeader(this.headerTransparent);
    window.requestAnimationFrame(() => this.mapEmitter.next(['center']));

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
            const [pickup, dropoff] = this.draftData.destinations;
            this.locations.pickup = pickup.address;
            this.locations.dropoff = dropoff.address;
            this.locations.pickupLat = pickup.lat;
            this.locations.pickupLng = pickup.lng;
            this.locations.dropoffLat = dropoff.lat;
            this.locations.dropoffLng = dropoff.lng;
            this.locations.pickupPostalCode = pickup.zip_code;
            this.locations.dropoffPostalCode = dropoff.zip_code;
            this.locations.place_id_pickup = pickup.place_id;
            this.locations.place_id_dropoff = dropoff.place_id;
            this.typeMap = 'draft';
            window.requestAnimationFrame(() => this.googlemaps.updateDataLocations(this.locations));
            this.showNewOrderCard();
          } else {
            window.requestAnimationFrame(() => this.mapEmitter.next(['center']));
          }
        }
      })
    );

    this.mapDashboardService.startReload.subscribe(() => this.mapEmitter.next(['startReload']));
  }

  ngOnInit(): void {
    this.locationsService.dataObtained$.subscribe((dataObtained: boolean) => {
      this.showTrafficButton = dataObtained; // Mostrar u ocultar el botón de tráfico según se hayan obtenido los datos
    });

    setTimeout(() => {
      this.mostrarBoton = true;
    }, 8000);
    // this.showNewOrderCard();

    // Set the name of the hidden property and the change event for visibility
    let visibilityChange: string;
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
              )
            )
          )
        )
      )
        .pipe(filter(() => !this.creatingForms))
        .subscribe((cleanRefresh) => {
          this.mapDashboardService.getFleetDetails.next(cleanRefresh);
        })
    );

    if (this.primeService.loaded.isStopped) {
      this.isPrime = this.primeService.isPrime;
    } else {
      this.primeService.loaded.subscribe(() => {
        this.isPrime = this.primeService.isPrime;
      });
    }
  }

  ngOnDestroy(): void {
    this.headerStyle.changeHeader(false);
    this.subs.unsubscribe();
  }

  async createDraft() {
    const dropoffId = this.locations.place_id_dropoff;

    const draftPayload = {
      destinations: [
        {
          type: 'pickup',
          location: await this.getLocationId(this.locations.place_id_pickup)
        },
        {
          type: 'dropoff',
          location: dropoffId ? await this.getLocationId(dropoffId) : undefined
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
    this.mapDashboardService.showFleetMap = false;
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

  makeMarker(position, icon, title) {
    this.mapDashboardService.makeMarker.next({ position, icon, title });
  }

  onStepChange(step: number) {
    this.showSidebar = !this.showOrderDetails || step < 3;
  }

  creatingForms: boolean = false;
  openOrderMenu: boolean = false;

  getCoordinates(data: any) {
    if (this.inputDirections.autocompleteDropoff.input || this.inputDirections.autocompletePickup.input) {
      this.mapDashboardService.showFleetMap = true;
      this.inputDirections.ClearAutocompleteDropoff();
      this.inputDirections.ClearAutocompletePickup();
    }

    this.creatingForms = true;
    this.openOrderMenu = false;
    this.mapDashboardService.getCoordinates.next(data);
  }

  clearedFilter() {
    if (!this.creatingForms && (this.inputDirections.autocompleteDropoff.input || this.inputDirections.autocompletePickup.input)) return;
    this.clearMap();
    this.creatingForms = false;
    this.mapDashboardService.getFleetDetails.next(false);
  }

  clearMap() {
    this.mapDashboardService.clearMap.next();
    this.openOrderMenu = true;
  }

  trafficLayer: google.maps.TrafficLayer;
  isTrafficActive: boolean = false;
}
