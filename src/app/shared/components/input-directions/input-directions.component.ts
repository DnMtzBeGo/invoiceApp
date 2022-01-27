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
  Renderer2
} from '@angular/core';
import { GoogleLocation } from 'src/app/shared/interfaces/google-location';
import { AuthService } from '../../services/auth.service';
import { googleAutocompleted } from '../../interfaces/google-autocomplete';
import { GoogleMapsService } from '../../services/google-maps/google-maps.service';
import { HomeComponent } from '../../../pages/home/home.component';
import { Subscription } from 'rxjs';
declare var google: any;

@Component({
  selector: 'app-input-directions',
  templateUrl: './input-directions.component.html',
  styleUrls: ['./input-directions.component.scss']
})
export class InputDirectionsComponent implements OnInit {
  @ViewChild('pickup') public searchPickup!: ElementRef;
  @ViewChild('dropoff') public searchDropOff!: ElementRef;
  @ViewChild('btnOrder', { static: false }) public btnOrder!: ElementRef;

  @Input('typeMap') public typeMap?: string;
  @Input('savedPlaces') savedPlaces = new Set<string>([]);

  @Output('showNewOrderCard') showNewOrderCard = new EventEmitter<void>();
  @Output('updateLocations') updateLocations =
    new EventEmitter<GoogleLocation>();
  @Output('inputPlace') inputPlaceEmmiter = new EventEmitter<
    ['add' | 'delete', string]
  >();

  pickupSelected: boolean = false;
  dropoffSelected: boolean = false;

  private locations: GoogleLocation = {
    pickup: '',
    dropoff: '',
    pickupLat: '',
    pickupLng: '',
    dropoffLat: '',
    dropoffLng: '',
    pickupPostalCode: 0,
    dropoffPostalCode: 0
  };

  subscription: Subscription;
  geocoder = new google.maps.Geocoder();
  map: any;
  bounds: any;
  start: any;
  end: any;

  autocompleteDropoff: googleAutocompleted = { input: '' };
  autocompleteItemsDropoff: any[] = [];
  autocompletePickup: googleAutocompleted = { input: '' };
  autocompleteItemsPickup: any[] = [];
  GoogleAutocomplete: any;

  savedLocationsOthers: any = [];
  activeInput: string = '';
  activeHome: boolean = false;
  activeWork: boolean = false;
  selectedPickup: boolean = false;
  selectedDropoff: boolean = false;
  invalidAddressPickup: boolean = false;
  invalidAddressDropoff: boolean = false;

  startMarker: any = {};
  endMarker: any = {};
  markersArray: any = [];

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: '#FFBE00',
      strokeWeight: 2
    }
  });

  markerStyle = [
    new google.maps.Size(84, 84),
    new google.maps.Point(0, 0),
    new google.maps.Point(42, 42)
  ];
  icons = {
    start: new google.maps.MarkerImage(
      '../assets/map/start.svg',
      ...this.markerStyle
    ),
    end: new google.maps.MarkerImage(
      '../assets/map/end.svg',
      ...this.markerStyle
    )
  };

  @Input() showMapPreview: boolean = false;

  hideMap: boolean = false;
  hideType: string = '';

  constructor(
    private auth: AuthService,
    public zone: NgZone,
    public render: Renderer2,
    private googlemaps: GoogleMapsService,
    @Inject(HomeComponent) public parent: HomeComponent
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.subscription = this.googlemaps.previewMapStatus.subscribe((data) => {
      if (data) {
        this.hideType = data;
        this.hideMap = true;
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Set a default Pickup for development
    // this.UpdateSearchResultsPickup({ target: { value: 'City Shops' } });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  async selectSearchResultPickup(item: any) {
    if (this.parent.showOrderDetails) {
      this.showMapPreview = true;
    }

    const placeId = item.place_id;
    (
      await this.auth.apiRest(
        `{ "place_id" : "${placeId}" }`,
        'orders/place_details'
      )
    ).subscribe(
      async (res) => {
        this.pickupSelected = true;
        // console.log(res);
        this.autocompletePickup.input = res.result.address;
        this.locations.pickup = res.result.address;
        this.locations.pickupLat = res.result.location.lat;
        this.locations.pickupLng = res.result.location.lng;
        this.locations.pickupPostalCode = parseInt(res.result.zip_code);
        this.autocompleteItemsPickup = [];
        this.startMarker.position = new google.maps.LatLng(
          this.locations.pickupLat,
          this.locations.pickupLng
        );
        this.selectedPickup = true;
        if (this.autocompleteDropoff.input !== '') {
          this.googlemaps.updateDataLocations(this.locations);
          this.updateLocations.emit(this.locations);
          this.hideMap = false;
        } else {
          this.searchDropOff.nativeElement.focus();
        }
      },
      async (res) => {
        this.ClearAutocompletePickup();
        console.log('Fetch Error', res.error);
      }
    );
  }

  async selectSearchResultDropoff(item: any) {
    const placeId = item.place_id;
    (
      await this.auth.apiRest(
        `{ "place_id" : "${placeId}" }`,
        'orders/place_details'
      )
    ).subscribe(
      async (res) => {
        this.dropoffSelected = true;
        // console.log(res);
        this.autocompleteDropoff.input = res.result.address;
        this.locations.dropoff = res.result.address;
        this.locations.dropoffLat = res.result.location.lat;
        this.locations.dropoffLng = res.result.location.lng;
        this.locations.dropoffPostalCode = parseInt(res.result.zip_code);
        this.autocompleteItemsDropoff = [];
        this.endMarker.position = new google.maps.LatLng(
          this.locations.dropoffLat,
          this.locations.dropoffLng
        );
        this.selectedDropoff = true;
        if (this.autocompletePickup.input !== '') {
          this.googlemaps.updateDataLocations(this.locations);
          this.updateLocations.emit(this.locations);
          this.hideMap = false;
        } else {
          this.searchPickup.nativeElement.focus();
        }
      },
      async (res) => {
        this.ClearAutocompleteDropoff();
        console.log('Fetch Error', res.error);
      }
    );

    this.showMapPreview = true;
  }

  focusOutInputPickup() {
    this.activeInput = 'pickup';
    if (this.locations.pickupPostalCode < 1) {
      this.autocompletePickup.input = '';
      this.invalidAddressPickup = false;
    }
  }

  focusOutInputDropoff() {
    this.activeInput = 'dropoff';
    if (this.locations.dropoffPostalCode < 1) {
      this.autocompleteDropoff.input = '';
      this.invalidAddressDropoff = false;
    }
  }

  ClearAutocompleteDropoff() {
    this.autocompleteItemsDropoff = [];
    this.invalidAddressDropoff = false;
  }

  ClearAutocompletePickup() {
    this.autocompleteItemsPickup = [];
    this.invalidAddressPickup = false;
  }

  closeAutoCompletePickup() {
    this.autocompleteItemsPickup = [];
    this.selectedPickup = false;
    this.invalidAddressPickup = false;
  }

  closeAutoCompleteDropoff() {
    this.autocompleteItemsDropoff = [];
    this.selectedDropoff = false;
    this.invalidAddressDropoff = false;
  }

  UpdateSearchResultsDropoff(e: any) {
    this.showMapPreview = false;
    this.dropoffSelected = false;

    this.autocompleteDropoff.input = e.target.value;
    if (this.autocompleteDropoff.input == '') {
      this.autocompleteItemsDropoff = [];
      return;
    }

    this.GoogleAutocomplete.getPlacePredictions(
      {
        input: this.autocompleteDropoff.input,
        componentRestrictions: { country: ['mx', 'us'] }
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
              // console.log(this.autocompleteItemsDropoff)
            });
          }
        });
      }
    );
  }

  UpdateSearchResultsPickup(e: any) {
    this.showMapPreview = false;
    this.pickupSelected = false;

    this.autocompletePickup.input = e.target.value;
    if (this.autocompletePickup.input === '') {
      this.autocompleteItemsPickup = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions(
      {
        input: this.autocompletePickup.input,
        componentRestrictions: { country: ['mx', 'us'] }
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
              // console.log(this.autocompleteItemsPickup)
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
  }

  togglePlace(placeId: string, event: MouseEvent): void {
    const isIconAddress = (event.target as HTMLElement)?.closest(
      '.list-icon-address'
    );

    if (!isIconAddress) return;

    event.stopPropagation();

    this.inputPlaceEmmiter.emit([
      !this.savedPlaces.has(placeId) ? 'add' : 'delete',
      placeId
    ]);
  }

  cancelChangeLocations() {
    this.hideMap = false;
  }
}
