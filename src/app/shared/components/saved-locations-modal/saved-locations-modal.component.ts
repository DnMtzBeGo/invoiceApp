import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { SavedLocationsService } from '../../services/saved-locations.service';

@Component({
  selector: 'app-saved-locations-modal',
  templateUrl: './saved-locations-modal.component.html',
  styleUrls: ['./saved-locations-modal.component.scss']
})
export class SavedLocationsModalComponent {
  saved = false;
  name = '';
  error = '';
  lang = 'en';

  constructor(
    private dialogRef: MatDialogRef<SavedLocationsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public savedLocations: SavedLocationsService,
    public translateService: TranslateService
  ) {
    this.name = this.data.name;
    this.lang = this.translateService.currentLang;

    this.translateService.onLangChange.subscribe(({ lang }) => {
      this.lang = lang;
    });
  }

  async close(e: string) {
    if (e === 'cancel' || (e === 'done' && this.saved)) {
      this.dialogRef.close();
      return;
    }

    if (!this.name) return;

    try {
      if (this.data.location_id) {
        await this.savedLocations.edit(this.data.location_id, this.name);
      } else {
        await this.savedLocations.save(this.data.place_id, this.name);
      }

      this.saved = true;
    } catch ({ error }) {
      this.error = error.error.message;
    }
  }
}
