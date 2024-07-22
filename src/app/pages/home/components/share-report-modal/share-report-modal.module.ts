import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoModalModule } from '@begomx/ui-components';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ShareReportModalComponent } from './share-report-modal.component';

@NgModule({
  declarations: [ShareReportModalComponent],
  imports: [CommonModule, BegoModalModule, ReactiveFormsModule, TranslateModule],
  exports: [ShareReportModalComponent],
})
export class ShareReportModalModule {}
