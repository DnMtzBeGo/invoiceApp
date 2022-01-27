import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { MatSelectModule } from '@angular/material/select';
import { BegoAddressAutocompleteModule } from 'src/app/shared/components/bego-address-autocomplete/bego-address-autocomplete.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule} from '@angular/material/icon';
import { BegoAlertModule } from 'src/app/shared/components/bego-alert/bego-alert.module';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [
    ProfileComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    BegoAlertModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    BegoPhoneInputModule,
    BegoAddressAutocompleteModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule
  ]
})
export class ProfileModule { }
