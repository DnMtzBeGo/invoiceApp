import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolygonFilter } from './polygon-filter.component';
import { BegoIconsModule, BegoPolygonFilterModule } from '@begomx/ui-components';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ShareReportModalModule } from '../share-report-modal/share-report-modal.module';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeService } from 'src/app/shared/services/prime.service';
@NgModule({
  providers: [PrimeService],
  declarations: [PolygonFilter],
  imports: [CommonModule, BegoIconsModule, BegoPolygonFilterModule, MatCheckboxModule, ShareReportModalModule, TranslateModule],
  exports: [PolygonFilter]
})
export class PolygonFilterModule {}
