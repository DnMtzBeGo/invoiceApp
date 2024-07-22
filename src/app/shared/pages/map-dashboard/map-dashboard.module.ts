import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BegoIconsModule, BegoPolygonsMapModule } from '@begomx/ui-components';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

import { FleetModule } from 'src/app/pages/fleet/fleet.module';
import { HomeModule } from 'src/app/pages/home/home.module';
import { MapModule } from 'src/app/shared/components/map/map.module';
import { MapDashboardRoutingModule } from './map-dashboard-routing.module';
import { MapDashboardComponent } from './map-dashboard.component';
import { MarkerInfoWindowComponent } from './components/marker-info-view.component';
import { ShareReportModalModule } from 'src/app/pages/home/components/share-report-modal/share-report-modal.module';

@NgModule({
  declarations: [MapDashboardComponent, MarkerInfoWindowComponent],
  imports: [
    CommonModule,
    MapDashboardRoutingModule,
    HomeModule,
    FleetModule,
    MapModule,
    BegoIconsModule,
    BegoPolygonsMapModule,
    MatCheckboxModule,
    TranslateModule,
    FormsModule,
    ShareReportModalModule
  ],
  exports: [MarkerInfoWindowComponent],
})
export class MapDashboardModule {}
