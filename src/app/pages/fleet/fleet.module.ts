import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FleetRoutingModule } from './fleet-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

import { FleetPageComponent, FleetBrowserComponent } from './containers';

import { FleetWidgetComponent, MemberCardComponent, TruckCardComponent, TrailerCardComponent, FleetTableComponent } from './components';

@NgModule({
  declarations: [
    FleetWidgetComponent,
    FleetPageComponent,
    FleetBrowserComponent,
    MemberCardComponent,
    TruckCardComponent,
    TrailerCardComponent,
    FleetTableComponent
  ],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, FleetRoutingModule, TranslateModule, SharedModule]
})
export class FleetModule {}
