import { EventEmitter, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { SavedLocationsModalComponent } from '../components/saved-locations-modal/saved-locations-modal.component';

@Injectable({
  providedIn: 'root'
})
export class SavedLocationsService {
  ids = new Set();
  locations = [];
  locationsChange = new EventEmitter();

  constructor(private auth: AuthService, private matDialog: MatDialog) {
    this.loadLocations();
  }

  async loadLocations() {
    (await this.auth.apiRestGet('favorite_locations', { apiVersion: 'v1.1' })).subscribe(({ result }) => {
      this.ids.clear();
      result.forEach((i: any) => this.ids.add(i.place_id));

      this.locations = result;
      this.locationsChange.emit();
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
      panelClass: 'saved-locations-modal'
    });
  }

  isSaved(location: any) {
    return this.ids.has(location?.place_id);
  }
}
