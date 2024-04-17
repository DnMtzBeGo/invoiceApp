import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { PaymentsComponent } from './payments.component';
import { PaymentsRoutingModule } from './payments-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  BegoDragDropModule,
  BegoTableModule,
  BegoAlertModule,
  BegoDragDropDocumentsModule,
  BegoButtonToggleModule,
  BegoTableMultipleSelectionModule,
  BegoTextAreaModule,
  BegoIconsModule
} from '@begomx/ui-components';

import { PaymentsTableComponent } from './components/payments-table/payments-table.component';
import { PaymentsUploadModalComponent } from './components/payments-upload-modal/payments-upload-modal.component';

import { NgxCurrencyModule } from 'ngx-currency';
import { EditedModalComponent } from './components/edited-modal/edited-modal.component';
import { FilesViewModalComponent } from './components/files-view-modal/files-view-modal.component';
import { TextMaskModule } from 'angular2-text-mask';
import { ListViewModalComponent } from './components/list-view-modal/list-view-modal.component';
import { DocumentSizePipe } from 'src/app/shared/pipes/document-size/document-size.pipe';
import { MoneyFormatterPipe } from 'src/app/shared/pipes/money-formatter/money-formatter.pipe';
import { BankDetailsModalComponent } from './components/bank-details-modal/bank-details-modal.component';
import { MessagesModalComponent } from './components/messages-modal/messages-modal.component';
import { AppMaterialModule } from 'src/app/material';
@NgModule({
  declarations: [
    PaymentsComponent,
    PaymentsTableComponent,
    PaymentsUploadModalComponent,
    EditedModalComponent,
    FilesViewModalComponent,
    ListViewModalComponent,
    DocumentSizePipe,
    MoneyFormatterPipe,
    BankDetailsModalComponent,
    MessagesModalComponent
  ],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    BegoAlertModule,
    BegoDragDropModule,
    BegoTableModule,
    BegoTableMultipleSelectionModule,
    BegoDragDropDocumentsModule,
    BegoIconsModule,
    NgxCurrencyModule,
    TextMaskModule,
    BegoButtonToggleModule,
    BegoTextAreaModule,
    AppMaterialModule
  ],
  providers: [DatePipe, CurrencyPipe]
})
export class PaymentsModule {}
