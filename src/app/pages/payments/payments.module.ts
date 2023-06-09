import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsComponent } from './payments.component';
import { PaymentsRoutingModule } from './payments-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  BegoAlertModule,
  BegoButtonModule,
  BegoButtonToggleModule,
  BegoCalendarTimeModule,
  BegoCheckoutCardModule,
  BegoCircularAvatarModule,
  BegoDragDropModule,
  BegoEditCnButtonModule,
  BegoPhoneCodeSelectModule,
  BegoRadioBulletModule,
  BegoRadioButtonModule,
  BegoSelectModule,
  BegoSearchSelectModule,
  BegoTextInputModule,
  BegoTextAreaModule,
  BegoTooltipModule,
  BegoHistoryCardModule,
  BegoInputDirectionsModule
} from '@begomx/ui-components';
import { PaymentsTableComponent } from './components/payments-table/payments-table.component';
@NgModule({
  declarations: [PaymentsComponent, PaymentsTableComponent],
  imports: [
    CommonModule,
    PaymentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    BegoAlertModule,
    BegoButtonModule,
    BegoButtonToggleModule,
    BegoCalendarTimeModule,
    BegoCheckoutCardModule,
    BegoCircularAvatarModule,
    BegoDragDropModule,
    BegoEditCnButtonModule,
    BegoPhoneCodeSelectModule,
    BegoRadioBulletModule,
    BegoRadioButtonModule,
    BegoSelectModule,
    BegoSearchSelectModule,
    BegoTextInputModule,
    BegoTextAreaModule,
    BegoTooltipModule,
    BegoHistoryCardModule,
  BegoInputDirectionsModule
    
  ]
})
export class PaymentsModule {}
