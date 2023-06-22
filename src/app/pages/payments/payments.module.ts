import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { PaymentsComponent } from './payments.component';
import { PaymentsRoutingModule } from './payments-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BegoDragDropModule, BegoTableModule } from '@begomx/ui-components';

import { PaymentsTableComponent } from './components/payments-table/payments-table.component';
import { PaymentsUploadModalComponent } from './components/payments-upload-modal/payments-upload-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [PaymentsComponent, PaymentsTableComponent, PaymentsUploadModalComponent],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    BegoDragDropModule,
    BegoTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule
  ],
  providers: [DatePipe, CurrencyPipe]
})
export class PaymentsModule {}
