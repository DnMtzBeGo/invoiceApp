import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FleetRoutingModule } from './fleet-routing.module';
import { FleetWidgetModule } from 'src/app/shared/components/fleet-widget/fleet-widget.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

import { FleetPageComponent, FleetBrowserComponent } from './containers';

import { MemberCardComponent, TruckCardComponent, TrailerCardComponent } from './components';

@NgModule({
  declarations: [FleetPageComponent, FleetBrowserComponent, MemberCardComponent, TruckCardComponent, TrailerCardComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FleetRoutingModule,
    FleetWidgetModule,
    TranslateModule,
    SharedModule
  ]
})
export class FleetModule {}
