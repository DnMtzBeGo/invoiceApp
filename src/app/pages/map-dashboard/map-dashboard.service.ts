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
  clearedFilter = new Subject();

  userRole: number | null = null;
  showFleetMap = true;
  showPolygons = true;

  haveNotFleetMembers = false;
  haveFleetMembersErrors: string[] = [];

  constructor() {}
}
