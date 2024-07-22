import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FleetModule } from 'src/app/pages/fleet/fleet.module';
import { PolygonFilterModule } from 'src/app/pages/home/components/polygon-filter/polygon-filter.module';
import { HomeModule } from 'src/app/pages/home/home.module';
import { MapModule } from 'src/app/shared/components/map/map.module';
import { MapDashboardRoutingModule } from './map-dashboard-routing.module';
import { MapDashboardComponent } from './map-dashboard.component';
import { MarkerInfoWindowComponent } from './components/marker-info-view.component';
import { BegoIconsModule, BegoPolygonsMapModule } from '@begomx/ui-components';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MapDashboardComponent, MarkerInfoWindowComponent],
  imports: [
    CommonModule,
    MapDashboardRoutingModule,
    HomeModule,
    FleetModule,
    PolygonFilterModule,
    MapModule,
    BegoIconsModule,
    BegoPolygonsMapModule,
    MatCheckboxModule,
    TranslateModule,
    FormsModule,
  ],
  exports: [MarkerInfoWindowComponent],
})
export class MapDashboardModule {}
