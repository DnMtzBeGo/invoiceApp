import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputDirectionsComponent } from './input-directions.component';
import { ButtonModule } from '../button/button.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleAddressModule } from '../../pipes/google-address/google-address.module';
import { MapModule } from '../map/map.module';
import { TranslateModule } from '@ngx-translate/core';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CircularAvatarModule } from 'src/app/shared/components/circular-avatar/circular-avatar.module';
import { FleetMembersModule } from 'src/app/shared/components/fleet-members/fleet-members.module';
import { MemberCardSelectionModule } from 'src/app/shared/components/member-card-selection/member-card-selection.module';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [InputDirectionsComponent],
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleAddressModule,
    MapModule,
    TranslateModule,
    TimepickerModule,
    CircularAvatarModule,
    FleetMembersModule,
    MemberCardSelectionModule,
    AppMaterialModule
  ],
  exports: [InputDirectionsComponent]
})
export class InputDirectionsModule {}
