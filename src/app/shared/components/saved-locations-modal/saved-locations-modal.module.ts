import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedLocationsModalComponent } from './saved-locations-modal.component';
import { BegoModalModule } from '@begomx/ui-components';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [SavedLocationsModalComponent],
  imports: [
    CommonModule,
    BegoModalModule,
    FormsModule,
    TranslateModule
  ]
})
export class SavedLocationsModalModule { }
