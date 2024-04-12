import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { NotificationsService } from './notifications.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { SavedLocationsModalComponent } from '../components/saved-locations-modal/saved-locations-modal.component';

@Injectable({
  providedIn: 'root'
})
export class SavedLocationsService {
  show = false;
  ids = new Set();
  locations = [];
  rawLocations = [];
  filterInput = new Subject<string>();

  constructor(
    private auth: AuthService,
    private notificationService: NotificationsService,
    private translateService: TranslateService,
    private matDialog: MatDialog
  ) {
    this.loadLocations();
    this.setupInputFilter();
  }

  async loadLocations() {
    (await this.auth.apiRestGet('favorite_locations', { apiVersion: 'v1.1' })).subscribe(({ result }) => {
      this.ids.clear();
      result.forEach((i: any) => this.ids.add(i.place_id));

      this.locations = result;
      this.rawLocations = result;
    });
  }

  async save(place_id: string, name: string) {
    const payload = { place_id, name };

    await (await this.auth.apiRest(JSON.stringify(payload), 'favorite_locations', { apiVersion: 'v1.1' })).toPromise();
    this.loadLocations();
  }

  async edit(location_id: string, name: string) {
    const payload = { location_id, name };

    await (await this.auth.apiRestPut(JSON.stringify(payload), 'favorite_locations', { apiVersion: 'v1.1' })).toPromise();
    this.loadLocations();
  }

  async remove(location: any) {
    (await this.auth.apiRestDel(`favorite_locations/${location.location_id}`, { apiVersion: 'v1.1' })).subscribe(() => {
      this.loadLocations();
    });
  }

  openModal(location: any) {
    this.matDialog.open(SavedLocationsModalComponent, {
      data: location,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'saved-locations-modal',
    });
  }

  isSaved(location: any) {
    return this.ids.has(location?.place_id);
  }

  private setupInputFilter() {
    this.filterInput
      .pipe(
        throttleTime(300, undefined, { leading: true, trailing: true }),
        map((v) => v.toLowerCase())
      )
      .subscribe((v) => {
        this.locations = this.rawLocations.filter((item) => item.name.toLowerCase().includes(v));
      });
  }

  // private showInvalidNotification() {
  //   this.notificationService.showErrorToastr(this.translateService.instant('location.txt_invalidDriection'));
  // }

  // private async isValidLocation(place_id: string) {
  //   const payload = { place_id };

  //   return (await this.auth.apiRest(JSON.stringify(payload), 'orders/place_details')).toPromise();
  // }
}
