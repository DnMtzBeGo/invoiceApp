import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { PaymentsComponent } from './payments.component';
import { PaymentsRoutingModule } from './payments-routing.module';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BegoTableModule } from '@begomx/ui-components';
import { PaymentsTableComponent } from './components/payments-table/payments-table.component';

@NgModule({
  declarations: [PaymentsComponent, PaymentsTableComponent],
  imports: [CommonModule, PaymentsRoutingModule, FormsModule, TranslateModule, BegoTableModule],
  providers: [DatePipe, CurrencyPipe]
})
export class PaymentsModule {}
