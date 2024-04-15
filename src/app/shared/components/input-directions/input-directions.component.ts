import {
  Component,
  OnInit,
  Input,
  NgZone,
  ViewChild,
  Output,
  EventEmitter,
  ElementRef,
  Inject,
  SimpleChanges,
  Renderer2,
  ChangeDetectorRef,
} from "@angular/core";
import { Subscription } from "rxjs";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from "@ngx-translate/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { GoogleLocation } from "src/app/shared/interfaces/google-location";
import { AuthService } from "../../services/auth.service";
import { googleAutocompleted } from "../../interfaces/google-autocomplete";
import { GoogleMapsService } from "../../services/google-maps/google-maps.service";
import { HomeComponent } from "../../../pages/home/home.component";
import { AlertService } from "src/app/shared/services/alert.service";
import { PinComponent } from "src/app/shared/components/pin/pin.component";
import * as moment from "moment";
import { NotificationsService } from "../../services/notifications.service";
import { SavedLocationsService } from "../../services/saved-locations.service";

declare var google: any;

@Component({
  selector: "app-input-directions",
  templateUrl: "./input-directions.component.html",
  styleUrls: ["./input-directions.component.scss"],
})
export class InputDirectionsComponent implements OnInit {
  @ViewChild("pickup") public searchPickup!: ElementRef;
  @ViewChild("dropoff") public searchDropOff!: ElementRef;
  @ViewChild("btnOrder", { static: false }) public btnOrder!: ElementRef;

  @Input("typeMap") public typeMap?: string;
  @Input() drafts: Array<object> = [];
  @Input() haveFleetMembers: boolean = false;
  @Input() haveFleetMembersErrors: Array <string> = [];

  @Output("showNewOrderCard") showNewOrderCard = new EventEmitter<void>();
  @Output("updateLocations") updateLocations =
    new EventEmitter<GoogleLocation>();
  @Output("updateLocation") updateLocation =
    new EventEmitter();
  @Output("updateDatepickup") updateDatepickup = new EventEmitter<number>();
  @Output("updateDropOffDate") updateDropOffDate = new EventEmitter<number>();
  @Output("inputPlace") inputPlaceEmmiter = new EventEmitter<
    ["add" | "delete", string]
  >();
  @Output() sendAssignedMermbers = new EventEmitter<any>();
  @Output() sendUserWantCP = new EventEmitter<any>();

  @Input() orderType: string;
  @Output() orderTypeChange = new EventEmitter<string>();

  @Input() isPrime = false;

  lang = 'en';
  langListener = null;
  pickupSelected: boolean = false;
  dropoffSelected: boolean = false;
  events: string = "DD / MM / YY";
  calendar: any = new Date();
  lastTime: any;
  firstLoad: boolean = true;
  destroyPicker: boolean = false;
  minTime: Date = new Date(Date.now());
  maxTime: Date = new Date();
  ismeridian: boolean = false;
  aproxETA: number = 0;
  drivers: Array<object> = [];
  trucks: Array<object> = [];
  trailers: Array<object> = [];
  vehicle: Array<object> = [];
  walkingData: any = null;
  selectMembersToAssign: any = {};
  fleetData: any;
  isDatesSelected: boolean = false;
  showFleetMembersContainer: boolean = false;
  canGoToSteps: boolean = false;
  showScroll: boolean = false;
  titleFleetMembers: any = "";
  fromDate: number = 0;
  toDate: number = 0;
  public monthSelected: boolean = true;
  public changeLocations: boolean = false;
  public provisionalPickupLocation: string = "";
  public provisionalDropoffLocation: string = "";
  public userWantCP: boolean = false;

  orderTypeList = [
    { label: 'FTL', value: 'FTL' },
    { label: 'OCL', value: 'OCL' },
  ];

  orderForm = new FormGroup({
    datepickup: new FormControl(this.events, Validators.required),
    timepickup: new FormControl(this.events),
  });

  locations: GoogleLocation = {
    pickup: "",
    dropoff: "",
    pickupLat: "",
    pickupLng: "",
    dropoffLat: "",
    dropoffLng: "",
    pickupPostalCode: 0,
    dropoffPostalCode: 0,
    place_id_pickup: '',
    place_id_dropoff: ''
  };

  subscription: Subscription;
  map: any;
  bounds: any;
  start: any;
  end: any;

  autocompleteDropoff: googleAutocompleted = { input: "" };
  autocompleteItemsDropoff: any[] = [];
  autocompletePickup: googleAutocompleted = { input: "" };
  autocompleteItemsPickup: any[] = [];
  GoogleAutocomplete: any;

  activeInput: 'pickup' | 'dropoff' = 'pickup';
  activeHome: boolean = false;
  activeWork: boolean = false;
  invalidAddressPickup: boolean = false;
  invalidAddressDropoff: boolean = false;
  userCanCreateOrders: boolean = false;

  startMarker: any = {};
  endMarker: any = {};
  markersArray: any = [];

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#FFE000",
      strokeWeight: 2,
    },
  });

  markerStyle = [
    new google.maps.Size(84, 84),
    new google.maps.Point(0, 0),
    new google.maps.Point(42, 42),
  ];
  icons = {
    start: new google.maps.MarkerImage(
      "../assets/map/start.svg",
      ...this.markerStyle
    ),
    end: new google.maps.MarkerImage(
      "../assets/map/end.svg",
      ...this.markerStyle
    ),
  };

  @Input() showMapPreview: boolean = false;

  hideMap: boolean = false;
  hideType: string = "";

  constructor(
    private auth: AuthService,
    public zone: NgZone,
    public render: Renderer2,
    private googlemaps: GoogleMapsService,
    private cdr: ChangeDetectorRef,
    private alertservice: AlertService,
    private notificationService: NotificationsService,
    private translateService: TranslateService,
    @Inject(HomeComponent) public parent: HomeComponent,
    private matDialog: MatDialog,
    public savedLocations: SavedLocationsService,
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.subscription = this.googlemaps.previewMapStatus.subscribe((data) => {
      if (data) {
        this.hideType = data;
        this.hideMap = true;
        this.isDatesSelected = false;
        this.pickupSelected = false;
      }

      if (data === "pickup" || data === "dropoff") this.changeLocations = true;
    });
  }

  ngOnInit(): void {
    this.canCreateOrders();

    this.orderTypeList[1].label = this.translateService.instant('fleet.prime.ocl');

    this.langListener = this.translateService.onLangChange.subscribe((lang) => {
      this.lang = lang.lang;

      this.orderTypeList[1].label = this.translateService.instant('fleet.prime.ocl');

      if (this.walkingData) {
        this.walkingData.attributes.vehicle_number = this.translateService.instant('orders.prime.walking');
      }
    });

    this.savedLocations.loadLocations();
  }

  ngOnDestroy(): void {
    this.langListener.unsubscribe();
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.hasOwnProperty("showMapPreview") &&
      !changes.showMapPreview.currentValue &&
      changes.showMapPreview.previousValue
      ) {
        this.showScroll = true;
      }
      
      if(changes.hasOwnProperty('drafts') && changes.drafts.currentValue) {
      this.locations.pickup = changes.drafts.currentValue.pickup.address;
      this.locations.pickupLat = changes.drafts.currentValue.pickup.lat;
      this.locations.pickupLng = changes.drafts.currentValue.pickup.lng;
      this.locations.place_id_pickup = changes.drafts.currentValue.pickup.place_id_pickup;
      this.locations.pickupPostalCode = changes.drafts.currentValue.pickup.zip_code;
      this.locations.dropoff = changes.drafts.currentValue.dropoff.address;
      this.locations.dropoffLat = changes.drafts.currentValue.dropoff.lat;
      this.locations.dropoffLng = changes.drafts.currentValue.dropoff.lng;
      this.locations.place_id_dropoff = changes.drafts.currentValue.dropoff.place_id_dropoff;
      this.locations.dropoffPostalCode = changes.drafts.currentValue.dropoff.zip_code;
      this.autocompletePickup.input = changes.drafts.currentValue.pickup.address;
      this.autocompleteDropoff.input = changes.drafts.currentValue.dropoff.address;
      this.pickupSelected = true;
      this.dropoffSelected = true;
      if(changes.drafts.currentValue.hasOwnProperty('stamp') && changes.drafts.currentValue.stamp) {
        this.userWantCP = true;
        this.sendUserWantCP.emit(true);
      }
    }
  }

  async selectSearchResultPickup(item: any) {
    if (!item) return;

    if (this.parent.showOrderDetails) {
      this.showMapPreview = true;
      this.dropoffSelected = true;
    }

    const payload = {
      place_id: item.place_id,
    };

    (await this.auth.apiRest(JSON.stringify(payload), 'orders/place_details')).subscribe({
      next: ({ result }) => {
        this.setAutoCompletePickup(item.place_id, result);
      },
      error: () => {
        this.ClearAutocompletePickup();
        this.notificationService.showErrorToastr(this.translateService.instant('location.txt_invalidDriection'));
      }
    });
  };

  async selectSearchResultDropoff(item: any) {
    if (!item) return;

    if (this.parent.showOrderDetails) {
      this.showMapPreview = true;
      this.pickupSelected = true;
    }

    const payload = {
      place_id: item.place_id,
    };

    (await this.auth.apiRest(JSON.stringify(payload), 'orders/place_details')).subscribe({
      next: ({ result }) => {
        this.setAutoCompleteDropoff(item.place_id, result);
      },
      error: () => {
        this.ClearAutocompleteDropoff();
        this.notificationService.showErrorToastr(this.translateService.instant('location.txt_invalidDriection'));
      }
    });
  };

  setAutoCompletePickup(placeId: string, data: any) {
    this.pickupSelected = true;
    this.autocompletePickup.input = data.address;
    this.locations.pickup = data.address;
    this.locations.pickupLat = data.location.lat;
    this.locations.pickupLng = data.location.lng;
    this.locations.pickupPostalCode = parseInt(data.zip_code);
    this.autocompleteItemsPickup = [];
    this.locations.place_id_pickup = placeId;

    this.startMarker.position = new google.maps.LatLng(
      this.locations.pickupLat,
      this.locations.pickupLng
    );

    this.handleUpdateLocations();
  }

  setAutoCompleteDropoff(placeId: string, data: any) {
    this.dropoffSelected = true;
    this.autocompleteDropoff.input = data.address;
    this.locations.dropoff = data.address;
    this.locations.dropoffLat = data.location.lat;
    this.locations.dropoffLng = data.location.lng;
    this.locations.dropoffPostalCode = parseInt(data.zip_code);
    this.autocompleteItemsDropoff = [];
    this.locations.place_id_dropoff = placeId;

    this.endMarker.position = new google.maps.LatLng(
      this.locations.dropoffLat,
      this.locations.dropoffLng
    );

    this.handleUpdateLocations();
  }

  handleUpdateLocations() {
    this.updateLocation.emit()

    if (this.autocompletePickup.input === '') {
      this.searchPickup.nativeElement.focus();
      return
    }

    if (this.autocompleteDropoff.input === '') {
      this.searchDropOff.nativeElement.focus();
      return
    }

    this.googlemaps.updateDataLocations(this.locations);
    this.updateLocations.emit(this.locations);
    this.hideMap = false;
  }

  ClearAutocompleteDropoff() {
    this.autocompleteItemsDropoff = [];
    this.invalidAddressDropoff = false;
    this.provisionalDropoffLocation = this.autocompleteDropoff.input;
    this.autocompleteDropoff.input = "";
    this.dropoffSelected = false;
    this.locations.dropoff = "";
    this.locations.dropoffLat = "";
    this.locations.dropoffLng = "";
    this.locations.dropoffPostalCode = 0;
  }

  ClearAutocompletePickup() {
    this.autocompleteItemsPickup = [];
    this.invalidAddressPickup = false;
    this.provisionalPickupLocation = this.autocompletePickup.input;
    this.autocompletePickup.input = "";
    this.pickupSelected = false;
    this.locations.pickup = "";
    this.locations.pickupLat = "";
    this.locations.pickupLng = "";
    this.locations.pickupPostalCode = 0;
  }

  UpdateSearchResultsDropoff(e: any) {
    this.showMapPreview = false;
    this.dropoffSelected = false;
    this.savedLocations.show = false;

    this.autocompleteDropoff.input = e.target.value;
    if (this.autocompleteDropoff.input == "") {
      this.autocompleteItemsDropoff = [];
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions(
      {
        input: this.autocompleteDropoff.input,
        componentRestrictions: { country: ["mx", "us"] },
      },
      (predictions: any) => {
        this.autocompleteItemsDropoff = [];
        this.zone.run(() => {
          if (!predictions) {
            this.invalidAddressDropoff = true;
          } else {
            predictions.forEach((prediction: any) => {
              this.autocompleteItemsDropoff.push(prediction);
              this.invalidAddressDropoff = false;
            });
          }
        });
      }
    );
  }

  UpdateSearchResultsPickup(e: any) {
    this.showMapPreview = false;
    this.pickupSelected = false;
    this.savedLocations.show = false;

    this.autocompletePickup.input = e.target.value;
    if (this.autocompletePickup.input === "") {
      this.autocompleteItemsPickup = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      {
        input: this.autocompletePickup.input,
        componentRestrictions: { country: ["mx", "us"] },
      },
      (predictions: any) => {
        this.autocompleteItemsPickup = [];
        this.zone.run(() => {
          if (!predictions) {
            this.invalidAddressPickup = true;
          } else {
            predictions.forEach((prediction: any) => {
              this.autocompleteItemsPickup.push(prediction);
              this.invalidAddressPickup = false;
            });
          }
        });
      }
    );
  }

  pickupAndDropoffProvided(): boolean {
    const pickupAndDropoffProvided =
      this.autocompletePickup.input.length > 0 &&
      this.autocompleteDropoff.input.length > 0;

    return pickupAndDropoffProvided;
  }

  openNewOrderMenu() {
    this.showNewOrderCard.emit();
    this.showMapPreview = true;
    this.showScroll = false;
    this.canGoToSteps = false;
    this.changeLocations = false;
    this.hideType = "";
  }

  cancelChangeLocations() {
    if (
      this.provisionalPickupLocation.length > 0 &&
      this.autocompletePickup.input.length === 0
    ) {
      this.autocompletePickup.input = this.provisionalPickupLocation;
    }

    if (
      this.provisionalDropoffLocation.length > 0 &&
      this.autocompleteDropoff.input.length === 0
    ) {
      this.autocompleteDropoff.input = this.provisionalDropoffLocation;
    }
    if (this.changeLocations) {
      this.changeLocations = false;
      this.hideType = "";
    }
    this.hideMap = false;
    this.isDatesSelected = true;
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    if (event.value) this.minTime = new Date(event.value);
    this.events = moment(new Date(`${event.value}`), "MM-DD-YYYY").format(
      "MMMM DD YYYY"
    );

    if (this.lastTime !== "DD / MM / YY") {
      this.updateDate();
    }

    this.monthSelected = false;
  }

  timepickerValid(data: any) {
    this.lastTime =
      this.orderForm.controls["timepickup"].value || this.lastTime;

    if (this.lastTime !== "DD / MM / YY" && this.events !== "DD / MM / YY") {
      this.updateDate();
    }

    this.firstLoad = false;
  }

  updateDate() {
    const hours = moment(this.lastTime).format("HH");
    const minutes = moment(this.lastTime).format("mm");
    const hoursInt = parseInt(hours);
    const minutesInt = parseInt(minutes);
    const resHours = hoursInt * 60 * 60000;
    const resMinutes = minutesInt * 60000;
    const resMilliseconds = resHours + resMinutes;
    const total = moment(this.events).valueOf();

    this.fromDate = total + resMilliseconds;
    this.isDatesSelected = true;
    this.showScroll = true;

    if (this.orderType === 'OCL') {
      this.getFleetListDetails();
    } else {
      this.getETA(this.locations);
    }

    this.updateDatepickup.emit(this.fromDate);
  }

  async getETA(data: any) {
    let requestETA = {
      pickup: {
        lat: data.pickupLat,
        lng: data.pickupLng,
      },
      dropoff: {
        lat: data.dropoffLat,
        lng: data.dropoffLng,
      },
    };

    (
      await this.auth.apiRest(
        JSON.stringify(requestETA),
        "orders/calculate_ETA"
      )
    ).subscribe(
      (res) => {
        let eta = res.result.ETA / 3600000;
        this.toDate = this.fromDate + res.result.ETA;
        this.aproxETA = Math.round(eta);
        this.updateDropOffDate.emit(this.toDate);
        this.getFleetListDetails();
      },
      (error) => {
        console.log("Something went wrong", error.error);
      }
    );
  }

  async getFleetListDetails() {
    const requestAvailavilityFleetMembers = {
      fromDate: this.fromDate,
      toDate: this.toDate,
    };

    (
      await this.auth.apiRest(
        JSON.stringify(requestAvailavilityFleetMembers),
        "orders/calendar",
        { apiVersion: "v1.1" }
      )
    ).subscribe(
      ({ result }) => {
        this.canGoToSteps = false;
        this.selectMembersToAssign.trucks = null;
        this.selectMembersToAssign.trailers = null;
        this.trucks = result.trucks;
        this.trailers = result.trailers;
      },
      (error) => {
        console.log("Something went wrong", error.error);
      }
    );

    this.getDrivers();
    this.getVehicles();
  }

  async getDrivers() {
    const q = new URLSearchParams();
    q.set('fromDate', String(this.fromDate));
    q.set('toDate', String(this.toDate));

    const req = await this.auth.apiRestGet(`orders/drivers_availability?${q.toString()}`, { apiVersion: 'v1.1' });
    const { result } = await req.toPromise();

    this.selectMembersToAssign.drivers = null;
    this.drivers = result;
  }

  async getVehicles() {
    const q = new URLSearchParams();
    q.set('fromDate', String(this.fromDate));
    q.set('toDate', String(this.toDate));

    const { result: categories } = await (await this.auth.apiRestGet('orders/vehicles', { apiVersion: 'v1.1' })).toPromise();

    const requests = categories.map(async (group) => {
      if (!group.has_vehicles) return;

      const { result: vehicles } = await (await this.auth.apiRestGet(`orders/vehicles/${group._id}?${q.toString()}`, { apiVersion: 'v1.1' })).toPromise();

      return {
        name: group.name,
        translations: group.translations,
        vehicles
      };
    });

    const vehicles = (await Promise.allSettled(requests))
      .filter((data) => data.status === 'fulfilled' && data.value)
      .map((data: any) => data.value);

    this.vehicle = vehicles;
    this.selectMembersToAssign.vehicle = null;
    this.walkingData = {
      availability: true,
      photo: '/assets/images/walking.svg',
      attributes: { vehicle_number: this.translateService.instant('orders.prime.walking') },
      isSelected: false,
      _id: null,
    }
  }

  private async canCreateOrders() {
    (await this.auth.apiRest('', 'carriers/can_create_orders')).subscribe( res => {
      this.userCanCreateOrders = true;
    }, error => {
      this.userCanCreateOrders = false;
      console.log('Something went wrong', error.error);
    })
  }

  public selectMembersForOrder(member: any, typeMember: keyof this) {
    if (this.userWantCP && !member.can_stamp) {
      return this.showAlert(
        this.translateService.instant(
          `home.alerts.cant-cp-${String(typeMember)}`
        )
      );
    }

    if (!member.availability)
      this.showAlert(
        this.translateService.instant(
          `home.alerts.not-available-${String(typeMember)}`
        )
      );

    if (this.selectMembersToAssign[typeMember]) {
      this.selectMembersToAssign[typeMember].isSelected = false;
    }

    member["isSelected"] = true;
    this.selectMembersToAssign[typeMember] = member;
    this.sendAssignedMermbers.emit({ ...this.selectMembersToAssign });
    this.canGoToSteps = this.isMembersSelected();
  }

  public showFleetContainer(memberType: keyof this) {
    this.titleFleetMembers = memberType;
    this.fleetData = this[memberType];
    this.showFleetMembersContainer = true;
  }
  // quitar el indesd de esta function
  public getMemberSelected(event: any) {
    this.selectMembersForOrder(event["member"], event["memberType"]);
    this.sendAssignedMermbers.emit({ ...this.selectMembersForOrder });
  }

  public closeFleetMembers(titleKey: keyof this): boolean {
    let obj = this[titleKey] as any;
    let result;
    for (const [i, iterator] of obj.entries()) {
      if (this.selectMembersToAssign[titleKey]._id === iterator._id && i > 3) {
        switch (titleKey) {
          case "drivers":
            result = this.drivers.splice(i, 1);
            this.drivers.unshift(result[0]);
            break;
          case "trucks":
            result = this.trucks.splice(i, 1);
            this.trucks.unshift(result[0]);
            break;
          case "trailers":
            result = this.trailers.splice(i, 1);
            this.trailers.unshift(result[0]);
            break;
        }
      }
    }
    return (this.showFleetMembersContainer = false);
  }

  public orderWithCP() {
    this.userWantCP = !this.userWantCP;
    this.sendUserWantCP.emit(this.userWantCP);
    if (this.userWantCP) {
      for (const iterator of this.drivers) {
        if (iterator["isSelected"] && !iterator["can_stamp"]) {
          iterator["isSelected"] = false;
          this.canGoToSteps = false;
          delete this.selectMembersToAssign.drivers;
        }
      }

      for (const iterator of this.trucks) {
        if (iterator["isSelected"] && !iterator["can_stamp"]) {
          iterator["isSelected"] = false;
          this.canGoToSteps = false;
          delete this.selectMembersToAssign.trucks;
        }
      }

      for (const iterator of this.trailers) {
        if (iterator["isSelected"] && !iterator["can_stamp"]) {
          iterator["isSelected"] = false;
          this.canGoToSteps = false;
          delete this.selectMembersToAssign.trailers;
        }
      }
    }
  }

  public showAlert(message: string) {
    this.alertservice.create({
      body: message,
      handlers: [
        {
          text: "Ok",
          color: "#FFE000",
          action: async () => {
            this.alertservice.close();
          },
        },
      ],
    });
  }

  // MODALS
  setLocationPin() {
    const isPickup = this.activeInput === 'pickup';
    const callback = isPickup ? this.selectSearchResultPickup : this.selectSearchResultDropoff;

    const geocodeRequest = {
      lat: isPickup ? this.locations.pickupLat : this.locations.dropoffLat,
      lng: isPickup ? this.locations.pickupLng : this.locations.dropoffLng
    }

    const dialogRef = this.matDialog.open(PinComponent, {
      data: geocodeRequest.lat && geocodeRequest.lng ? geocodeRequest : null,
      restoreFocus: false,
      autoFocus: false,
      panelClass: 'pin-modal-container',
      backdropClass: ["brand-dialog-map"],
    });

    dialogRef.afterClosed().subscribe((result?) => {
      if (result?.success === true) {
        callback.call(this, { place_id: result.data.place_id });
      }
    });
  }

  setOrderType(data: { enabled: boolean, value: string }) {
    this.orderTypeChange.emit(data.value);

    this.canGoToSteps =
      this.pickupSelected &&
      this.dropoffSelected &&
      this.fromDate &&
      this.isMembersSelected(data.value);
  }

  isMembersSelected(type: string = this.orderType): boolean {
    const requiredMembers = type === 'OCL' ? ['drivers', 'vehicle'] : ['drivers', 'trucks', 'trailers'];
    return requiredMembers.every((key) => Boolean(this.selectMembersToAssign[key]));
  }

  showFavoriteLocations() {
    this.autocompleteItemsPickup = [];
    this.invalidAddressPickup = false;
    this.autocompleteItemsDropoff = [];
    this.invalidAddressDropoff = false;

    this.savedLocations.show = true;
  }

  pickSavedLocation(location: any) {
    this.savedLocations.show = true;

    if (this.activeInput === 'pickup') {
      this.selectSearchResultPickup(location);
    } else {
      this.selectSearchResultDropoff(location);
    }
  }
}
