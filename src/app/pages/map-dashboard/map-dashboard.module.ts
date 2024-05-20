import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FleetModule } from '../fleet/fleet.module';
import { PolygonFilterModule } from '../home/components/polygon-filter/polygon-filter.module';
import { HomeModule } from '../home/home.module';
import { MapDashboardRoutingModule } from './map-dashboard-routing.module';
import { MapDashboardComponent } from './map-dashboard.component';

@NgModule({
  declarations: [MapDashboardComponent],
  imports: [CommonModule, MapDashboardRoutingModule, HomeModule, FleetModule, PolygonFilterModule]
})
export class MapDashboardModule {}
