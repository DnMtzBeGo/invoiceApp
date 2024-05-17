import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapDashboardService {
  getCoordinates = new Subject<any>();
  toggleTraffic = new Subject<void>();
  makeMarker = new Subject<any>();
  clearMap = new Subject<void>();
  getFleetDetails = new Subject<boolean>();
  centerMap = new Subject();

  userRole: number | null = null;

  haveNotFleetMembers = false;
  showFleetMap = true;

  constructor() {}
}
