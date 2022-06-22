import {
  Observable,
  noop,
  throwError,
  fromEventPattern,
  fromEvent,
  combineLatest,
  defer,
} from "rxjs";
import { map, exhaustMap, startWith } from "rxjs/operators";

export const fromGpsPosition = (options?) => {
  if (!("geolocation" in window.navigator))
    return throwError(Error("Geolocation is not available"));

  return Observable.create((observer) => {
    const success = (position) => {
      observer.next(position);
      observer.complete();
    };

    const error = (err) => {
      observer.error(err);
    };

    window.navigator.geolocation.getCurrentPosition(success, error, options);

    return noop;
  });
};

export const fromGpsWatchPosition = (options?) => {
  if (!("geolocation" in window.navigator))
    return throwError(Error("Geolocation is not available"));

  return Observable.create((observer) => {
    const success = (position) => {
      observer.next(position);
    };

    const error = (err) => {
      observer.error(err);
    };

    const watchID = window.navigator.geolocation.watchPosition(
      success,
      error,
      options
    );

    return () => window.navigator.geolocation.clearWatch(watchID);
  });
};

// prompt | denied | granted
export const fromGpsPermissions = () =>
  defer(() => window.navigator.permissions.query({ name: "geolocation" })).pipe(
    map((status) => status.state)
  );

export const fromGpsWatchPermissions = () =>
  defer(() => window.navigator.permissions.query({ name: "geolocation" })).pipe(
    exhaustMap((status) =>
      fromEvent(status, "change").pipe(
        map(() => status.state),
        startWith(status.state)
      )
    )
  );

export const fromMapEvent = (google, event) => (map) =>
  fromEventPattern(
    (hdl) => map.addListener(event, hdl),
    (hdl, listener) => google.maps.event.removeListener(listener)
  );

export const matchGeocodes = (gcodeA$, gcodeB$) =>
  combineLatest(gcodeA$, gcodeB$).pipe(
    map(([gcodeA, gcodeB]: any) => gcodeA.place_id === gcodeB.place_id)
  );
