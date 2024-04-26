// data-service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LocationsService {
  private dataObtainedSubject = new Subject<boolean>();
  dataObtained$ = this.dataObtainedSubject.asObservable();

  constructor() { }

  setDataObtained(value: boolean) {
    this.dataObtainedSubject.next(value);
  }
}