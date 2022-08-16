import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";
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
  fromEvent,
  interval
} from "rxjs";
import { mergeAll, tap, filter, startWith, mapTo, exhaustMap, takeUntil, catchError } from 'rxjs/operators'
import { AuthService } from "src/app/shared/services/auth.service";
import { PlacesService } from "src/app/shared/services/places.service";
import { GoogleMapsService } from "src/app/shared/services/google-maps/google-maps.service";
import { ProfileInfoService } from "../profile/services/profile-info.service";
import { HeaderService } from "./services/header.service";
import { ofType } from "src/app/shared/utils/operators.rx";
import { CustomMarker } from './custom.marker';

declare var google: any;
// 10 seconds for refreshing map markers
const markersRefreshTime = 1000 * 20;

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
  public drafts: Array<object> = [];
  public haveNotFleetMembers: boolean = false;
  public haveFleetMembersErrors: Array<string> = [];

  savedPlaces$ = this.placesService.places$;

  // members map logic
  geocoder = new google.maps.Geocoder();
  mapEmitter = new Subject<['startReload' | 'center' | 'hideFleetMap']>();
  map: any;
  googleMarkers: any[] = [];
  isMapDirty = false;
  dragCounter = 0;
  zoom_changedCounter = 0;
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

  constructor(
    private router: Router,
    private webService: AuthService,
    public placesService: PlacesService,
    private googlemaps: GoogleMapsService,
    private profileinfoService: ProfileInfoService,
    private headerStyle: HeaderService,
    private elementRef: ElementRef
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
            this.locations.place_id_pickup = data.draft.pickup.place_id_pickup;
            this.locations.place_id_dropoff = data.draft.dropoff.place_id_dropoff;
            this.typeMap = "draft";
            window.requestAnimationFrame(() =>
              this.googlemaps.updateDataLocations(this.locations)
            );
            /* this.showNewOrderCard(); */
          }
        }
      })
    );
  }

  ngOnInit(): void {
    // this.showNewOrderCard();
    // this.profileinfoService.getProfilePic();

    // Set the name of the hidden property and the change event for visibility
    let visibilityChange;
    if (typeof (document as any).hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      visibilityChange = "visibilitychange";
    } else if (typeof (document as any).msHidden !== "undefined") {
      visibilityChange = "msvisibilitychange";
    } else if (typeof (document as any).webkitHidden !== "undefined") {
      visibilityChange = "webkitvisibilitychange";
    }

    const pauseApp$ = fromEvent(document, visibilityChange)
      .pipe(filter(() => document.visibilityState === "hidden"));
    const resumeApp$ = fromEvent(document, visibilityChange)
      .pipe(filter(() => document.visibilityState === "visible"));

    this.subs.add(
      merge(
        this.mapEmitter.pipe(ofType('center'), mapTo(false), startWith(false)),
        resumeApp$.pipe(mapTo(false)),
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
                      this.isMapDirty = false
                      this.zoom_changedCounter = 0
                    }),
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

  showNewOrderCard() {
    this.showOrderDetails = true;
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

  private async getFleetDetails(cleanRefresh: boolean) {
    (
      await this.webService.apiRest('', 'carriers/home', {
        loader: cleanRefresh ? 'false' : 'true'
      })
    )
    .pipe(catchError(()=>of({})))
    .subscribe(
      (res) => {
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
        }
        else {
          this.showFleetMap = false;
          // this.showMap(cleanRefresh);
        }

        if (userRole && userRole !== 1) this.mapEmitter.next(['startReload']);
      }
    );
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
          // console.log('- drag (' + this.dragCounter + ') -');
          this.isMapDirty = true;
          this.dragCounter++;
        });

        google.maps.event.addListener(this.map, 'zoom_changed', () => {
          // console.log('- zoom_changed (' + this.zoom_changedCounter + ') -');
          if (this.zoom_changedCounter > 0) this.isMapDirty = true;
          this.zoom_changedCounter++;
        });
      });
    }

    const fromShowMap = this.map && this.map.fromShowMap === true;
    this.map =
      this.map != void 0 && !fromShowMap
        ? this.map
        : new google.maps.Map(this.mapRef.nativeElement, {
            zoom: 15,
            mapId: "893ce2d924d01422",
            disableDefaultUI: true,
            backgroundColor: '#040b12',
            keyboardShortcuts: false,
            center: {
              lat: this.markersFromService[0].position.lat,
              lng: this.markersFromService[0].position.lng
            }
          });
    this.map.setOptions({ maxZoom: this.maxZoom });

    // clean bounds, googleMarkers
    this.bounds = new google.maps.LatLngBounds();
    this.googleMarkers.forEach((marker) => {
      marker.setMap(null);
      marker.remove();
    });
    this.googleMarkers = [];

    for (var i = 0; i < this.markersFromService.length; i++) {
      let changePic = this.markersFromService[i].icon.split('');
      if (changePic[changePic.length - 1] === '/')
        this.markersFromService[i].icon = '../assets/images/user-outline.svg';

      const marker = new CustomMarker(
        new google.maps.LatLng(
          this.markersFromService[i].position.lat,
          this.markersFromService[i].position.lng
        ),
        this.map,
        this.markersFromService[i].icon,
        this.markersFromService[i].state,
        this.markersFromService[i].title
      );

      this.googleMarkers.push(marker);
      this.bounds.extend(marker.getPosition());
    }

    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      this.map.setOptions({ maxZoom: null });
      // console.log('bounds_changed');
    });

    if (cleanRefresh === false || fromShowMap || this.isMapDirty === false)
      this.map.fitBounds(this.bounds, { bottom: 50, top: 50, left: 80, right: 50 + 400 + 50 });
  }

  private getFleetDetails_() {
    return from(this.webService.apiRest('', 'carriers/home')).pipe(mergeAll(), tap((res: any) => {
       if(!res.result.trailers || !res.result.trucks) {
        this.haveNotFleetMembers = true;
       } else {
        this.haveNotFleetMembers = false;
       }

       if(res.result.hasOwnProperty('errors') && res.result.errors.length > 0) {
        this.haveFleetMembersErrors = res.result.errors;
       }

    }))
  }
}
