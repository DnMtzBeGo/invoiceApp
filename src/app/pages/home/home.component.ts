import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';

import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { AuthService } from 'src/app/shared/services/auth.service';
import { PlacesService } from 'src/app/shared/services/places.service';
import { GoogleMapsService } from 'src/app/shared/services/google-maps/google-maps.service';
import { HeaderService } from './services/header.service';
import { OrderPreview } from '../orders/orders.component';
import { InputDirectionsComponent } from 'src/app/shared/components/input-directions/input-directions.component';
import { PrimeService } from 'src/app/shared/services/prime.service';
import { LocationsService } from '../../services/locations.service';
import { MapDashboardService } from 'src/app/shared/pages/map-dashboard/map-dashboard.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('slideInFromBottom', [
      transition('void => *', [style({ transform: 'translateY(100%)' }), animate('500ms ease-out')]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild(InputDirectionsComponent) public inputDirections: InputDirectionsComponent;
  @Input() public locations: GoogleLocation = {
    pickup: '',
    dropoff: '',
    pickupLat: '',
    pickupLng: '',
    dropoffLat: '',
    dropoffLng: '',
    pickupPostalCode: 0,
    dropoffPostalCode: 0,
  };
  public datepickup: number;
  public datedropoff: number;
  public draftData: any;
  public orderPreview: OrderPreview;
  public headerTransparent: boolean = true;
  public showOrderDetails: boolean = false;

  public orderType = 'FTL';

  public typeMap: string = 'home';
  public imageFromGoogle: any;
  public membersToAssigned: object = {};
  public userWantCP: boolean = false;

  public subs = new Subscription();

  public showSidebar = true;
  public showCompleteModal = false;

  public isPrime = false;
  public showTrafficButton: boolean;

  constructor(
    private router: Router,
    private webService: AuthService,
    public placesService: PlacesService,
    private googlemaps: GoogleMapsService,
    private location: Location,
    public primeService: PrimeService,
    private locationsService: LocationsService,
    public mapDashboardService: MapDashboardService,
  ) {
    this.subs.add(
      this.router.events.subscribe((res) => {
        if (res instanceof NavigationEnd && res.url.startsWith('/home')) {
          this.cleanup();
        }
      }),
    );

    this.subs.add(this.mapDashboardService.getCoordinates.subscribe(() => this.getCoordinates()));
    this.subs.add(this.mapDashboardService.clearedFilter.subscribe(() => this.clearedFilter()));
    this.restoreDraft();
  }

  public ngOnInit(): void {
    const data = this.location.getState() as any;

    if (data?.showCompleteModal) {
      this.showCompleteModal = data.showCompleteModal;
      this.location.replaceState('');
    }

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

  public ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  public cleanup() {
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
      dropoffPostalCode: 0,
    };
  }

  public restoreDraft() {
    const data = this.location.getState() as any;

    if (!data?.draft) {
      this.updateMap();
      return;
    }

    console.log('restoring draft into home: ', data.draft);

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
    this.showNewOrderCard(false);
    this.location.replaceState(''); // removing draft data once consuming
  }

  public updateMap() {
    if (this.mapDashboardService.activeFilter) return;
    this.mapDashboardService.getFleetDetails.next(false);
  }

  public async createDraft(initDraft: boolean = false) {
    const dropoffId = this.locations.place_id_dropoff;

    const draftPayload = {
      destinations: [
        {
          type: 'pickup',
          location: await this.getLocationId(this.locations.place_id_pickup),
        },
        {
          type: 'dropoff',
          location: dropoffId ? await this.getLocationId(dropoffId) : undefined,
        },
      ],
      stamp: this.userWantCP,
      type: this.orderType,
      target: 'carriers',
      origin: 'web',
    };

    if (initDraft) {
      const req = await this.webService.apiRest(JSON.stringify(draftPayload), 'orders/create_draft', {
        apiVersion: 'v1.1',
      });

      const { result } = await req.toPromise();

      this.orderPreview = result;
    } else {
      this.orderPreview = {
        order_id: this.draftData._id,
        order_number: this.draftData.order_number,
        destinations: [this.draftData.destinations[0]._id, this.draftData.destinations[1]._id],
      };
    }

    this.showOrderDetails = true;
    this.mapDashboardService.showPolygons = false;
    this.mapDashboardService.showFleetMap = false;
  }

  public async showNewOrderCard(initDraft: boolean = false) {
    // al mostrar el mapa sin tener listo la data del draft/order, falla la visualizacion del los STEPS
    /* this.showOrderDetails = true;
    this.mapDashboardService.showPolygons = false;
    this.mapDashboardService.showFleetMap = false; */

    await this.createDraft(initDraft);
  }

  private async getLocationId(place_id: string): Promise<string> {
    const payload = { place_id };

    const req = await this.webService.apiRestPut(JSON.stringify(payload), 'orders/locations', {
      apiVersion: 'v1.1',
      loader: false,
    });

    const res = await req.toPromise();
    return res.result._id;
  }

  public updateLocation() {
    if (this.mapDashboardService.activeFilter) {
      this.clearMap();
      this.mapDashboardService.clearFilter.next();
      this.mapDashboardService.activeFilter = false;
    }
  }

  public updateLocations(data: GoogleLocation) {
    this.locations = { ...data };
    this.mapDashboardService.showFleetMap = Boolean(!data.pickup || !data.dropoff);
  }

  public updateDatepickup(data: number) {
    this.datepickup = data;
  }

  public updateDropOffDate(data: number) {
    this.datedropoff = data;
  }

  public getGoogleImageMap(data: any) {
    this.imageFromGoogle = data;
  }

  public getMembersToAssignedOrder(event: Event) {
    this.membersToAssigned = { ...event };
  }

  public getUserWantCP(event: boolean) {
    this.userWantCP = event;
  }

  public onStepChange(step: number) {
    this.showSidebar = !this.showOrderDetails || step < 3;
  }

  public getCoordinates() {
    if (this.inputDirections.autocompleteDropoff.input || this.inputDirections.autocompletePickup.input) {
      this.mapDashboardService.showFleetMap = true;
      this.inputDirections.ClearAutocompleteDropoff();
      this.inputDirections.ClearAutocompletePickup();
    }

    this.mapDashboardService.activeFilter = true;
    this.mapDashboardService.openOrderMenu = false;
  }

  public clearedFilter() {
    if (
      !this.mapDashboardService.activeFilter &&
      (this.inputDirections.autocompleteDropoff.input || this.inputDirections.autocompletePickup.input)
    )
      return;
    this.clearMap();
    this.mapDashboardService.activeFilter = false;
    this.mapDashboardService.getFleetDetails.next(false);
  }

  public clearMap() {
    this.mapDashboardService.clearMap.next();
    this.mapDashboardService.openOrderMenu = true;
  }

  public reloadMap() {
    if (this.mapDashboardService.activeFilter) this.mapDashboardService.reloadPolygons.next();
    else this.mapDashboardService.getFleetDetails.next(false);
  }

  public centerMap() {
    if (this.mapDashboardService.showFleetMap)
      this.mapDashboardService.centerMap.next(this.mapDashboardService.activeFilter);
    else this.mapDashboardService.centerRouteMap.next();
  }
}
