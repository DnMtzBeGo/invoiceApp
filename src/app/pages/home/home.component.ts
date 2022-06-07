import { Component, Input, OnInit } from "@angular/core";
import { GoogleLocation } from "src/app/shared/interfaces/google-location";
import { Router, NavigationEnd } from "@angular/router";
import {
  Subscription,
  Observable,
  of,
  Subject,
  BehaviorSubject,
  timer,
  merge,
  from,
} from "rxjs";
import { mapTo, tap, mergeAll } from "rxjs/operators";
import { AuthService } from "src/app/shared/services/auth.service";
import { PlacesService } from "src/app/shared/services/places.service";
import { GoogleMapsService } from "src/app/shared/services/google-maps/google-maps.service";
import { ProfileInfoService } from "../profile/services/profile-info.service";
import { HeaderService } from "./services/header.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  @Input() locations: GoogleLocation = {
    pickup: "",
    dropoff: "",
    pickupLat: "",
    pickupLng: "",
    dropoffLat: "",
    dropoffLng: "",
    pickupPostalCode: 0,
    dropoffPostalCode: 0,
  };
  datepickup: number;
  datedropoff: number;
  draftData: any;
  headerTransparent: boolean = true;
  showOrderDetails: boolean = false;

  public orderId: string = "";
  public typeMap: string = "home";
  public imageFromGoogle: any;
  public membersToAssigned: object = {};
  public userWantCP: boolean = false;

  savedPlaces$ = this.placesService.places$;

  subs = new Subscription();

  constructor(
    private router: Router,
    private webService: AuthService,
    public placesService: PlacesService,
    private googlemaps: GoogleMapsService,
    private profileinfoService: ProfileInfoService,
    private headerStyle: HeaderService
  ) {
    this.headerStyle.changeHeader(this.headerTransparent);
    this.subs.add(
      this.router.events.subscribe((res) => {
        if (res instanceof NavigationEnd && res.url === "/home") {
          let data = this.router.getCurrentNavigation()?.extras.state;
          if (data && data.hasOwnProperty("draft")) {
            this.draftData = data.draft;
            this.locations.pickup = data.draft.pickup.address;
            this.locations.dropoff = data.draft.dropoff.address;
            this.locations.pickupLat = data.draft.pickup.lat;
            this.locations.pickupLng = data.draft.pickup.lng;
            this.locations.dropoffLat = data.draft.dropoff.lat;
            this.locations.dropoffLng = data.draft.dropoff.lng;
            this.locations.pickupPostalCode = data.draft.pickup.zip_code;
            this.locations.dropoffPostalCode = data.draft.dropoff.zip_code;
            this.typeMap = "draft";
            window.requestAnimationFrame(() =>
              this.googlemaps.updateDataLocations(this.locations)
            );
            this.showNewOrderCard();
          }
        }
      })
    );
  }

  ngOnInit(): void {
    // this.showNewOrderCard();
    this.profileinfoService.getProfilePic();
  }

  ngOnDestroy(): void {
    this.headerStyle.changeHeader(false);
    this.subs.unsubscribe();
  }

  showNewOrderCard() {
    this.showOrderDetails = true;
  }

  updateLocations(data: GoogleLocation) {
    this.locations = data;
  }

  updateDatepickup(data: number) {
    this.datepickup = data;
  }

  updateDropOffDate(data: number) {
    this.datedropoff = data;
  }

  async getThumbnail() {
    let requestThumbnail: any = {
      id: this.orderId,
    };

    (await this.webService.apiRest(requestThumbnail, "profile/get_thumbnail")).subscribe(
      (res) => {},
      (error) => {
        console.log("Error", error);
      }
    );
  }

  getGoogleImageMap(data: any) {
    this.imageFromGoogle = data;
  }

  public getMembersToAssignedOrder(event: Event) {
    this.membersToAssigned = {...event};
  }

  public getUserWantCP(event: boolean) {
    this.userWantCP = event;
  } 
}
