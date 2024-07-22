import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapDashboardService {
  public centerMap = new Subject();
  public clearMap = new Subject();
  public getFleetDetails = new Subject<boolean>();
  public toggleTraffic = new Subject();

  // polygons
  public getCoordinates = new Subject<any>();
  public reloadPolygons = new Subject();
  public clearedFilter = new Subject();
  public clearFilter = new Subject();

  public userRole: number | null = null;
  public showFleetMap = true;
  public showPolygons = true;
  public activeFilter: boolean = false;
  public openOrderMenu: boolean = false;

  public haveNotFleetMembers = false;
  public haveFleetMembersErrors: string[] = [];
  public centerRouteMap = new Subject();

  constructor() {}
}
