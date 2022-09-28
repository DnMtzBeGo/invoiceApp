import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import {
  from,
  of,
  combineLatest,
  merge,
  timer,
  fromEvent,
  Subject,
  NEVER,
} from "rxjs";
import {
  mergeAll,
  catchError,
  delay,
  throttleTime,
  share,
  switchMap,
  tap,
  map,
  mapTo,
  filter,
  first,
  withLatestFrom,
  exhaustMap,
  startWith,
  shareReplay,
} from "rxjs/operators";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, or } from "src/app/shared/utils/operators.rx";
import { clone } from "src/app/shared/utils/object";
import { makeRequestStream } from "src/app/shared/utils/http.rx";
import {
  fromGpsPosition,
  fromMapEvent as fromMapEvent1,
  matchGeocodes,
  fromGpsWatchPermissions,
} from "src/app/shared/utils/maps.rx";
import { AuthService } from "src/app/shared/services/auth.service";

declare var google;

const maxZoom = 19;
const minZoom = 4;

@Component({
  selector: "app-pin",
  templateUrl: "./pin.component.html",
  styleUrls: ["./pin.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PinComponent implements OnInit {
  $rx = reactiveComponent(this);

  geocoder = new google.maps.Geocoder();

  zoom = 18;
  gpsLocationIcon = new google.maps.MarkerImage(
    "../../../../assets/images/maps/location.svg",
    new google.maps.Size(68, 68),
    new google.maps.Point(0, 0),
    new google.maps.Point(34, 34)
  );
  gpsLocationMarker;

  vm: {
    gpsLocationError?: any;
    idle?: any;
    center?: any;
    isDragging?: any;
    centerOnGps?: any;
    showUI?: any;
    effects?: any;
  };

  mapEmitter = new Subject<["resetLocation", unknown?]>();

  @ViewChild("map", { read: ElementRef, static: false }) mapRef: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<PinComponent>,
    private apiRestService: AuthService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const fromMapEvent = fromMapEvent1.bind(null, google);

    const map$ = this.$rx.afterViewInit$.pipe(
      map(() => {
        const mapOptions = {
          mapId: "893ce2d924d01422",
          zoom: this.zoom,
          // maxZoom,
          // minZoom,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          disableDefaultUI: true,
          backgroundColor: "#040b12",
          keyboardShortcuts: false,
        };

        return new google.maps.Map(this.mapRef.nativeElement, mapOptions);
      }),
      share()
    );

    const dragStart$ = map$.pipe(exhaustMap(fromMapEvent("dragstart")));
    // idle$ requires an immediate subscription
    const idle$ = map$.pipe(exhaustMap(fromMapEvent("idle")), share());
    const dragEndNative$ = map$.pipe(exhaustMap(fromMapEvent("dragend")));
    // simulated dragend
    const dragEnd$ = dragEndNative$.pipe(switchMap(() => idle$.pipe(first())));
    const dblClick$ = map$.pipe(exhaustMap(fromMapEvent("dblclick")));
    const centerChanged$ = map$.pipe(
      exhaustMap(fromMapEvent("center_changed"))
    );
    const mouseWheel$ = map$.pipe(
      exhaustMap(() =>
        fromEvent(this.mapRef.nativeElement, "mousewheel", {
          capture: true,
          passive: true,
        })
      )
    );

    const gpsLocation$ = fromGpsWatchPermissions()
      .pipe(
        switchMap((state) =>
          state === "denied"
            ? of(null)
            : fromGpsPosition({
                timeout: 10000,
                maximumAge: 1000 * 60 * 2,
              })
        )
      )
      .pipe(
        catchError(() => of(null)),
        shareReplay(1)
      );

    const gpsLocationError$ = gpsLocation$.pipe(
      map((position?: any) => position == void 0)
    );

    const geocodeRequest =
      this.data && typeof this.data === "string"
        ? { placeId: this.data }
        : this.data != void 0 && typeof this.data === "object"
        ? { location: this.data }
        : null;

    // get center from = place_id | GPS | users last location
    const initCenter$ = or(
      this.fetchGeocode(geocodeRequest),
      gpsLocation$.pipe(
        tap((position?: any) => {
          if (position == void 0) throw "Invalid position";
        }),
        switchMap((position?: any) =>
          this.fetchGeocode({
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          })
        ),
        first()
      ),
      this.fetchUserLastLocation().pipe(
        switchMap((location) =>
          this.fetchGeocode({
            location,
          })
        )
      )
    );

    const center$ = merge(
      initCenter$,
      dragEnd$.pipe(
        withLatestFrom(map$),
        switchMap(([_, map]) =>
          this.fetchGeocode({
            location: map.getCenter(),
          }).pipe(
            tap((geocode) => {
              Object.defineProperty(geocode, "bypassCenter", {
                value: true,
              });
            })
          )
        )
      ),
      gpsLocation$.pipe(
        switchMap((position: any) =>
          position == void 0
            ? NEVER
            : this.mapEmitter.pipe(
                ofType("resetLocation"),
                switchMap(() =>
                  this.fetchGeocode({
                    location: {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    },
                  })
                )
              )
        )
      )
    ).pipe(share());

    const isDragging$ = merge(
      dragStart$.pipe(mapTo(true)),
      dragEnd$.pipe(mapTo(false))
    );

    const centerOnGps$ = matchGeocodes(
      gpsLocation$.pipe(
        filter((position?: any) => position != void 0),
        switchMap((position?: any) =>
          this.fetchGeocode({
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          })
        )
      ),
      center$
    );

    const showUI$ = combineLatest(map$, center$).pipe(
      delay(200),
      mapTo(true),
      first(),
      startWith(false)
    );

    const actions$ = merge(
      center$.pipe(
        map((geocode: any) => (map) => {
          if (geocode.bypassCenter) return;
          map.setCenter(geocode.geometry.location);
        })
      ),
      dblClick$.pipe(
        map(() => (map) => {
          this.zoom = Math.min(this.zoom + 1, maxZoom);
          map.setZoom(this.zoom);
          // console.log("zoom:", this.zoom);
        })
      ),
      mouseWheel$.pipe(
        throttleTime(150),
        map((event: WheelEvent) => (map) => {
          if (event.deltaY > 1) this.zoom = Math.max(this.zoom - 1, minZoom);
          else this.zoom = Math.min(this.zoom + 1, maxZoom);
          map.setZoom(this.zoom);
          // console.log("zoom:", this.zoom);
        })
      ),
      gpsLocation$.pipe(
        map((position?: any) => (map) => {
          if (position && this.gpsLocationMarker == void 0) {
            this.gpsLocationMarker = new google.maps.Marker({
              position: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              map,
              icon: this.gpsLocationIcon,
              title: "location",
            });
          } else if (position && this.gpsLocationMarker) {
            this.gpsLocationMarker.setMap(map);
            this.gpsLocationMarker.setPosition({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          } else if (position == void 0 && this.gpsLocationMarker) {
            this.gpsLocationMarker.setMap(null);
          }
        })
      )
    );

    const effects$ = combineLatest(map$, actions$).pipe(
      tap(([map, action]: any) => action(map))
    );

    this.vm = this.$rx.connect({
      gpsLocationError: gpsLocationError$,
      idle: idle$,
      center: center$,
      isDragging: isDragging$,
      centerOnGps: centerOnGps$,
      showUI: showUI$,
      effects: effects$,
    });
  }

  closeModal() {
    this.dialogRef.close({
      success: false,
    });
  }

  sendAddress(geocode) {
    this.dialogRef.close({
      success: true,
      data: {
        lat: geocode.geometry.location.lat(),
        lng: geocode.geometry.location.lng(),
        zip_code: parseInt(
          geocode.address_components.find(
            (address) => address.types[0] === "postal_code"
          ).short_name
        ),
        address: geocode.formatted_address,
        place_id: geocode.place_id,
      },
    });
  }

  //API calls
  fetchGeocode = (request) => {
    return from(this.geocoder.geocode(request)).pipe(
      map(({ results }) => {
        if (results.length === 0) throw "No results found";

        // console.log(results);

        return results[0];
      })
    );
  };

  fetchUserLastLocation = () => {
    return from(
      this.apiRestService.apiRest("", "carriers/select_attributes", {
        loader: "false",
      })
    ).pipe(
      mergeAll(),
      map((response) => {
        if (
          !response?.result?.location?.lat ||
          !response?.result?.location?.lng
        )
          throw "No previous location";

        return {
          lat: response.result.location.lat,
          lng: response.result.location.lng,
        };
      })
    );
  };

  // UTILS
  log = (...args) => {
    console.log(...args);
  };

  splitGoogleAddress = (val) =>
    val == void 0 || val === "" ? "—" : val.split(",", 1);

  splitGoogleAddressSecond = (val) =>
    val == void 0 || val === "" ? "—" : val.substring(val.indexOf(",") + 1);
}
