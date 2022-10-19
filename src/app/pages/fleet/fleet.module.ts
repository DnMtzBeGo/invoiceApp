import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FleetRoutingModule } from './fleet-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

import { FleetPageComponent, FleetBrowserComponent } from './containers';

import { FleetWidgetComponent, MemberCardComponent, TruckCardComponent, TrailerCardComponent } from './components';
import { FleetEditComponent } from './containers/fleet-edit/fleet-edit.component';
import { BegoTabsModule } from 'src/app/shared/components/bego-tabs/bego-tabs.module';

@NgModule({
  declarations: [FleetWidgetComponent, FleetPageComponent, FleetBrowserComponent, MemberCardComponent, TruckCardComponent, TrailerCardComponent, FleetEditComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FleetRoutingModule,
    TranslateModule,
    SharedModule,
    BegoTabsModule
  ]
})
export class FleetModule {}
