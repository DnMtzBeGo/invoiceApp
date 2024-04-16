import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { BegoAddressAutocompleteModule } from 'src/app/shared/components/bego-address-autocomplete/bego-address-autocomplete.module';
import { BegoAlertModule } from 'src/app/shared/components/bego-alert/bego-alert.module';
import { ProfileComponent } from './profile.component';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    BegoAlertModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    BegoPhoneInputModule,
    BegoAddressAutocompleteModule,
    AppMaterialModule
  ]
})
export class ProfileModule {}
