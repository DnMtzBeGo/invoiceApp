import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { MapDashboardComponent } from '../map-dashboard/map-dashboard.component';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private routeStore = new Map<any, DetachedRouteHandle>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.routeConfig?.component === MapDashboardComponent;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.routeStore.set(route.routeConfig?.component, handle);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.routeStore.has(route.routeConfig?.component);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.routeStore.get(route.routeConfig?.component);
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}
