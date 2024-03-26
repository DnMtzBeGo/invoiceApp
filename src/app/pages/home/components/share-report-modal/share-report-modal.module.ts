import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareReportModalComponent } from './share-report-modal.component';
import { BegoModalModule } from '@begomx/ui-components';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [ShareReportModalComponent],
  imports: [CommonModule, BegoModalModule, FormsModule],
  exports: [ShareReportModalComponent]
})
export class ShareReportModalModule {}
