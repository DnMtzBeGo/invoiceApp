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
    if (!this.mustSave(route)) {
      this.clearStore()
      return false;
    }

    return this.routeStore.has(route.routeConfig?.component);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.routeStore.get(route.routeConfig?.component);
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private clearStore() {
    this.routeStore.forEach((handler: any) => {
      handler?.componentRef.destroy();
    });

    this.routeStore.clear();
  }

  private mustSave(route: ActivatedRouteSnapshot): boolean {
    const url = this.getResolvedUrl(route);
    return ['home', 'fleet'].some((segment) => url.startsWith(`/${segment}`));
  }

  private getResolvedUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot.map((v) => v.url.map((segment) => segment.toString()).join('/')).join('/');
  }
}
