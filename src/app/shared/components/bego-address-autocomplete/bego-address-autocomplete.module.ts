import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoAddressAutocompleteComponent } from './bego-address-autocomplete.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    BegoAddressAutocompleteComponent,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    TranslateModule,
  ],
  exports: [
    BegoAddressAutocompleteComponent,
  ]
})
export class BegoAddressAutocompleteModule { }
