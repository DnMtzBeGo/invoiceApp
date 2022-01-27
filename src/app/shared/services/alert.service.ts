import { Injectable } from '@angular/core';
import {
  Observable,
  Subject,
  of,
  concat
} from 'rxjs';
import {
  concatMap,
  delay,
  first
} from 'rxjs/operators';
import { ofType } from 'src/app/shared/utils/operators.rx';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private emmiter: Subject<any> = new Subject();
  public alert$: Observable<any>;

  constructor() {
    const createAction$ = this.emmiter.pipe(ofType('create'));
    const closeAction$ = this.emmiter.pipe(ofType('close'));

    this.alert$ = createAction$.pipe(
      concatMap((data) =>
        concat(
          of(data).pipe(delay(250)),
          closeAction$.pipe(first())
        )
      )
    );
  }

  create(data: any) {
    this.emmiter.next(['create', data]);
  }

  close() {
    this.emmiter.next(['close']);
  }
}
