import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareReportModalComponent } from './share-report-modal.component';
import { BegoModalModule } from '@begomx/ui-components';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [ShareReportModalComponent],
  imports: [CommonModule, BegoModalModule, ReactiveFormsModule],
  exports: [ShareReportModalComponent]
})
export class ShareReportModalModule {}
