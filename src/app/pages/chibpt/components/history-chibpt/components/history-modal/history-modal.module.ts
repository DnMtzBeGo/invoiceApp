import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryModalComponent } from './history-modal.component';
import { BegoModalModule } from '@begomx/ui-components';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [HistoryModalComponent],
  imports: [CommonModule, BegoModalModule, ReactiveFormsModule, TranslateModule],
  exports: [HistoryModalComponent]
})
export class HistoryModalModule {}
