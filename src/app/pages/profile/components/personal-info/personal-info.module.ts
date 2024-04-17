import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonalInfoRoutingModule } from './personal-info-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { TranslateModule } from '@ngx-translate/core';
import { PersonalInfoComponent } from './personal-info.component';
import { BegoAlertModule } from 'src/app/shared/components/bego-alert/bego-alert.module';
import { BegoAddressAutocompleteModule } from 'src/app/shared/components/bego-address-autocomplete/bego-address-autocomplete.module';
import { VerificationModalComponent } from '../verification-modal/verification-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [PersonalInfoComponent, VerificationModalComponent],
  imports: [
    CommonModule,
    PersonalInfoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BegoPhoneInputModule,
    TranslateModule,
    BegoAlertModule,
    BegoAddressAutocompleteModule,
    SharedModule,
    AppMaterialModule
  ]
})
export class PersonalInfoModule {}
