import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapDashboardService {
  centerMap = new Subject();
  clearMap = new Subject();
  getFleetDetails = new Subject<boolean>();
  toggleTraffic = new Subject();

  // polygons
  getCoordinates = new Subject<any>();
  reloadPolygons = new Subject();
  clearedFilter = new Subject();
  clearFilter = new Subject();

  userRole: number | null = null;
  showFleetMap = true;
  showPolygons = true;

  haveNotFleetMembers = false;
  haveFleetMembersErrors: string[] = [];
  centerRouteMap = new Subject();

  constructor() {}
}
