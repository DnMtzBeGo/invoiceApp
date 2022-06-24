import {
  pipe,
  of,
  combineLatest as combineLatestRxjs,
  EMPTY,
  asapScheduler,
} from "rxjs";
import {
  filter,
  pluck,
  switchMap,
  map,
  startWith,
  tap,
  catchError,
  observeOn,
  debounceTime,
} from "rxjs/operators";
import { searchInObject, isObject } from "./object";

export const oof = (val) => of(val).pipe(observeOn(asapScheduler));

export const ofType = (_type: string): any =>
  pipe(
    filter(([type]) => type === _type),
    pluck("1")
  );

export const combineLatest = (sources) => {
  if (!isObject(sources)) return combineLatestRxjs(sources);

  const keys = Object.keys(sources);
  const values = Object.values(sources);

  return combineLatestRxjs(values).pipe(
    map((values: any[]) =>
      Object.fromEntries(values.map((value, i) => [keys[i], value]))
    )
  );
};

export const simpleFilters = (searchAction$) => (source$) => {
  return source$.pipe(
    switchMap((object) => {
      return combineLatest(
        Object.fromEntries(
          Object.entries(object).map(([key, list]) => {
            return [
              key,
              searchAction$.pipe(
                ofType(key),
                debounceTime(150),
                map((search: string) =>
                  search !== "" ? list.filter(searchInObject(search)) : list
                ),
                startWith(list)
              ),
            ];
          })
        )
      );
    })
  );
};

export const or = (...observables) => {
  if (observables.length === 0) return EMPTY;

  return observables.reduce((obs, nextObs) => {
    return obs.pipe(catchError(() => nextObs));
  });
};
