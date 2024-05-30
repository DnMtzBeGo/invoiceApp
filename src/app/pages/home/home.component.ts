import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PlacesService } from 'src/app/shared/services/places.service';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';
import { HeaderService } from './services/header.service';
import { OrderPreview } from '../orders/orders.component';
import { Location } from '@angular/common';
import { InputDirectionsComponent } from 'src/app/shared/components/input-directions/input-directions.component';
import { trigger, style, animate, transition } from '@angular/animations';
import { PrimeService } from 'src/app/shared/services/prime.service';
import { LocationsService } from '../../services/locations.service';
import { MapDashboardService } from 'src/app/shared/pages/map-dashboard/map-dashboard.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('slideInFromBottom', [transition('void => *', [style({ transform: 'translateY(100%)' }), animate('500ms ease-out')])])
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild(InputDirectionsComponent) inputDirections: InputDirectionsComponent;
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
    private location: Location,
    public primeService: PrimeService,
    private locationsService: LocationsService,
    public mapDashboardService: MapDashboardService
  ) {
    this.subs.add(
      this.router.events.subscribe((res) => {
        if (res instanceof NavigationEnd && res.url.startsWith('/home')) {
          this.cleanup();

          const data = this.router.getCurrentNavigation()?.extras.state;

          if (data?.showCompleteModal) {
            this.showCompleteModal = data.showCompleteModal;
            this.location.replaceState('');
          }
        }
      })
    );

    this.subs.add(this.mapDashboardService.getCoordinates.subscribe(() => this.getCoordinates()));
    this.subs.add(this.mapDashboardService.clearedFilter.subscribe(() => this.clearedFilter()));
    this.restoreDraft();
  }

  ngOnInit(): void {
    this.locationsService.dataObtained$.subscribe((dataObtained: boolean) => {
      this.showTrafficButton = dataObtained; // Mostrar u ocultar el botón de tráfico según se hayan obtenido los datos
    });

    if (this.primeService.loaded.isStopped) {
      this.isPrime = this.primeService.isPrime;
    } else {
      this.primeService.loaded.subscribe(() => {
        this.isPrime = this.primeService.isPrime;
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  cleanup() {
    this.showOrderDetails = false;
    this.draftData = null;
    this.datepickup = 0;
    this.userWantCP = false;
    this.membersToAssigned = {};
    this.locations = {
      pickup: '',
      dropoff: '',
      pickupLat: '',
      pickupLng: '',
      dropoffLat: '',
      dropoffLng: '',
      pickupPostalCode: 0,
      dropoffPostalCode: 0
    };
  }

  restoreDraft() {
    const data = this.location.getState() as any;

    if (!data.draft) {
      this.updateMap();
      return
    }

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
    this.location.replaceState(''); // removing draft data once consuming
  }

  updateMap() {
    if (this.creatingForms) return;
    this.mapDashboardService.getFleetDetails.next(false);
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
    this.mapDashboardService.showPolygons = false;
    this.mapDashboardService.showFleetMap = false;
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
      this.mapDashboardService.clearFilter.next();
      this.creatingForms = false;
    }
  }

  updateLocations(data: GoogleLocation) {
    this.locations = data;
    this.mapDashboardService.showFleetMap = Boolean(!data.pickup || !data.dropoff);
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

  onStepChange(step: number) {
    this.showSidebar = !this.showOrderDetails || step < 3;
  }

  creatingForms: boolean = false;
  openOrderMenu: boolean = false;

  getCoordinates() {
    if (this.inputDirections.autocompleteDropoff.input || this.inputDirections.autocompletePickup.input) {
      this.mapDashboardService.showFleetMap = true;
      this.inputDirections.ClearAutocompleteDropoff();
      this.inputDirections.ClearAutocompletePickup();
    }

    this.creatingForms = true;
    this.openOrderMenu = false;
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

  reloadMap() {
    if (this.creatingForms) this.mapDashboardService.reloadPolygons.next();
    else this.mapDashboardService.getFleetDetails.next(false);
  }

  centerMap() {
    if (this.mapDashboardService.showFleetMap) this.mapDashboardService.centerMap.next(this.creatingForms);
    else this.mapDashboardService.centerRouteMap.next();
  }
}
