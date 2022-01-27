import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {

  updateData = new EventEmitter();
  previewMapStatus = new EventEmitter();

  constructor(private http: HttpClient) {}

  updateDataLocations(data: any) {
    this.updateData.emit(data);
  }

  hidePreviewMap(data: string) {
    this.previewMapStatus.emit(data)
  }
}
