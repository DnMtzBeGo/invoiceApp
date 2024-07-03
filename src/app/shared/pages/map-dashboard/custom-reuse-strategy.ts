import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { MapDashboardComponent } from '../map-dashboard/map-dashboard.component';

interface SavedData {
  lastUrl: string;
  handler: DetachedRouteHandle;
}

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private routeStore = new Map<any, SavedData>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.mustSave(route);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if (!handle) return;

    const url = this.getResolvedUrl(route)
    this.routeStore.set(route.component, {
      lastUrl: url,
      handler: handle
    });
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const url = this.getResolvedUrl(route);
    if (!url || !route.component) return false;

    if (!this.mustSave(route)) {
      this.clearStore();
    }

    const data = this.routeStore.get(route.component);
    if (!data || data.lastUrl === url) return false

    return this.routeStore.has(route.component);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.routeStore.get(route.component).handler;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private clearStore() {
    this.routeStore.forEach((data) => {
      (data.handler as any).componentRef.destroy();
    });

    this.routeStore.clear();
  }

  private mustSave(route: ActivatedRouteSnapshot): boolean {
    return route.component === MapDashboardComponent
  }

  private getResolvedUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot.map((v) => v.url.map((segment) => segment.toString()).join('/')).join('/');
  }
}
