// import { ɵmarkDirty as markDirty } from "@angular/core";
import { Observable, ReplaySubject, from, concat } from 'rxjs';
import { mergeMap, tap, takeUntil } from 'rxjs/operators';

type ObservableDictionary<T> = {
  [P in keyof T]: Observable<T[P]>;
};

export function reactiveComponent(cmp: any) {
  const cmpType = cmp.__proto__;

  const onInit = new ReplaySubject<void>(1);
  const afterViewInit = new ReplaySubject<void>(1);
  const onDestroy = new ReplaySubject<void>(1);

  const onInit$ = onInit.asObservable();
  const afterViewInit$ = afterViewInit.asObservable();
  const onDestroy$ = onDestroy.asObservable();

  const oldOnInit = cmpType.ngOnInit;
  cmpType.ngOnInit = () => {
    oldOnInit && oldOnInit.call(cmp);
    onInit.next();
    onInit.complete();
    cmpType.ngOnInit = oldOnInit;
  };

  const oldAfterViewInit = cmpType.ngAfterViewInit;
  cmpType.ngAfterViewInit = () => {
    oldAfterViewInit && oldAfterViewInit.call(cmp);
    afterViewInit.next();
    afterViewInit.complete();
    cmpType.ngAfterViewInit = oldAfterViewInit;
  };

  const oldOnDestroy = cmpType.ngOnDestroy;
  cmpType.ngOnDestroy = () => {
    oldOnDestroy && oldOnDestroy.call(cmp);
    onDestroy.next();
    onDestroy.complete();
    cmpType.ngOnDestroy = oldOnDestroy;
  };

  return {
    connect: function <T>(sources: ObservableDictionary<T>): T {
      const sink = {} as T;

      const sourceKeys = Object.keys(sources) as (keyof T)[];
      const updateSink$ = from(sourceKeys).pipe(
        mergeMap((sourceKey) => sources[sourceKey].pipe(tap((sinkValue) => (sink[sourceKey] = sinkValue))))
      );

      concat(onInit$, updateSink$)
        .pipe(takeUntil(onDestroy$))
        .subscribe(() => cmp.cdr?.markForCheck() || cmp.cd?.markForCheck());

      return sink;
    },
    onInit$,
    afterViewInit$,
    onDestroy$
  };
}
