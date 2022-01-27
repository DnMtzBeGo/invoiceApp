import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputDirectionsComponent } from './input-directions.component';
import { ButtonModule } from '../button/button.module';
import { FormsModule } from '@angular/forms';
import { GoogleAddressModule } from '../../pipes/google-address/google-address.module';

import { MatTabsModule } from '@angular/material/tabs';
import { MapModule } from '../map/map.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    InputDirectionsComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    GoogleAddressModule,
    MatTabsModule,
    MapModule,
    TranslateModule
  ],
  exports: [
    InputDirectionsComponent
  ]
})
export class InputDirectionsModule { }
