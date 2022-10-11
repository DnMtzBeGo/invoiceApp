import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetWidgetComponent } from './fleet-widget.component';
import { ButtonModule } from '../button/button.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleAddressModule } from '../../pipes/google-address/google-address.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MapModule } from '../map/map.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CircularAvatarModule } from 'src/app/shared/components/circular-avatar/circular-avatar.module';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

@NgModule({
  declarations: [
    FleetWidgetComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleAddressModule,
    MatTabsModule,
    MapModule,
    TranslateModule,
    MatFormFieldModule,
    MatDatepickerModule,
    TimepickerModule,
    MatInputModule,
    CircularAvatarModule,
    MatSlideToggleModule
  ],
  exports: [
    FleetWidgetComponent
  ]
})
export class FleetWidgetModule { }
