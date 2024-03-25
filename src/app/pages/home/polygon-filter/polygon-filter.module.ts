import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolygonFilter } from './polygon-filter.component';
import { BegoIconsModule, BegoPolygonFilterModule } from '@begomx/ui-components';
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({
  declarations: [PolygonFilter],
  imports: [CommonModule, BegoIconsModule, BegoPolygonFilterModule, MatCheckboxModule],
  exports: [PolygonFilter]
})
export class PolygonFilterModule {}
