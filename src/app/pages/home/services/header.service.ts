import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  styleHeader = new EventEmitter();

  constructor() {}

  changeHeader(data: boolean) {
    this.styleHeader.emit(data);
  }
}
