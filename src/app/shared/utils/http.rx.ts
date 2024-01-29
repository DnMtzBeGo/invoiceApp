import { of, merge, NEVER, noop, from } from 'rxjs';
import { map, exhaustMap, share, filter, delay, tap, switchMap, catchError } from 'rxjs/operators';

const notNull = (val) => val != void 0;

export function makeRequestStream({
  fetch$,
  reset$ = NEVER,
  mergeStrategy = exhaustMap,
  fetch,
  successDelay = 1800,
  errorDelay = 1800,
  afterSuccess = noop,
  afterSuccessDelay = noop,
  afterError = noop,
  unwrapData = 'result'
}: any) {
  fetch$ = fetch$.pipe(share());

  const request$ = fetch$.pipe(
    mergeStrategy((data) =>
      from(fetch(data)).pipe(
        catchError((error) => {
          return of(
            error.error?.result ??
              error.error ?? {
                message: error.statusText ?? error.message
              }
          );
        })
      )
    ),
    share()
  );

  const loading$ = merge(of(false), fetch$.pipe(map(() => true)), request$.pipe(map(() => false)));

  const data$ = merge(
    request$.pipe(
      filter((requestData) => requestData[unwrapData] != void 0),
      map((unwrapData) => unwrapData),
      tap(afterSuccess)
    ),
    merge(fetch$, reset$).pipe(map(() => void 0))
  ).pipe(share());

  const error$ = merge(
    merge(fetch$, reset$).pipe(map(() => void 0)),
    request$.pipe(
      filter((requestData) => requestData[unwrapData] == void 0),
      tap(afterError)
    )
  ).pipe(share());

  const success$ = fetch$.pipe(
    switchMap(() =>
      merge(
        of(void 0),
        data$.pipe(
          filter(notNull),
          map(() => true)
        ),
        data$.pipe(
          filter(notNull),
          delay(successDelay),
          tap(afterSuccessDelay),
          map(() => void 0)
        ),
        error$.pipe(
          filter(notNull),
          map(() => false)
        ),
        error$.pipe(
          filter(notNull),
          delay(errorDelay),
          map(() => void 0)
        )
      )
    )
  );

  return {
    loading$,
    data$,
    error$,
    success$
  };
}

export const makeCRUDStream = () => {
  return {};
};
