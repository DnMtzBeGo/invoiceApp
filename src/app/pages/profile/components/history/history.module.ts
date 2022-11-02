import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HistoryRoutingModule } from './history-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { HistoryComponent } from './history.component';
import { BegoAlertModule } from 'src/app/shared/components/bego-alert/bego-alert.module';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BegoAddressAutocompleteModule } from 'src/app/shared/components/bego-address-autocomplete/bego-address-autocomplete.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { HistoryModule as HistoryModule1 } from 'src/app/pages/history/history.module';

// import { VerificationModalComponent } from '../verification-modal/verification-modal.component';

@NgModule({
  declarations: [
    HistoryComponent,
    // VerificationModalComponent
  ],
  imports: [
    CommonModule,
    HistoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    BegoPhoneInputModule,
    MatInputModule,
    TranslateModule,
    BegoAlertModule,
    MatSelectModule,
    MatButtonModule,
    BegoAddressAutocompleteModule,
    MatAutocompleteModule,
    MatIconModule,
    HistoryModule1
  ]
})
export class HistoryModule {}
