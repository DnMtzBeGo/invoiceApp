import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapDashboardService {
  getCoordinates = new Subject<any>();
  updateMap = new Subject<boolean>();
  toggleTraffic = new Subject<void>();
  makeMarker = new Subject<any>();
  clearMap = new Subject<void>();
  getFleetDetails = new Subject<boolean>();

  startReload = new Subject<void>();

  userRole: string | null = null;

  haveNotFleetMembers = false;
  showFleetMap = true;

  constructor() {}
}
