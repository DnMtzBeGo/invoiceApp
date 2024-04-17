import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingComponent } from './tracking.component';
import { TrackingRoutingModule } from './tracking-routing.module';
import { MapModule } from 'src/app/shared/components/map/map.module';
import { ModalTrackingComponent } from './components/modal-tracking/modal-tracking.component';
import { VerticalCardModule } from '../../shared/components/vertical-card/vertical-card.module';
import { DropDownModule } from '../../shared/components/drop-down/drop-down.module';
import { AddRemoveCounterModule } from '../../shared/components/add-remove-counter/add-remove-counter.module';
import { InputBorderRadiusBottomModule } from '../../shared/components/input-border-radius-bottom/input-border-radius-bottom.module';
import { ButtonModule } from '../../shared/components/button/button.module';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [TrackingComponent, ModalTrackingComponent],
  imports: [
    CommonModule,
    TrackingRoutingModule,
    MapModule,
    VerticalCardModule,
    DropDownModule,
    AddRemoveCounterModule,
    InputBorderRadiusBottomModule,
    ButtonModule,
    AppMaterialModule
  ]
})
export class TrackingModule {}
