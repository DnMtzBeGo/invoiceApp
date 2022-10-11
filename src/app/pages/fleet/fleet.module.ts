import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetRoutingModule } from './fleet-routing.module';
import { FleetWidgetModule } from 'src/app/shared/components/fleet-widget/fleet-widget.module';
import { FleetComponent } from './fleet.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    FleetComponent,
  ],
  imports: [
    CommonModule,
    FleetRoutingModule,
    FleetWidgetModule,
    MatTabsModule,
  ]
})
export class FleetModule { }
