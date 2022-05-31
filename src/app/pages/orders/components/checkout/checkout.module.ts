import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout.component';

import { StepperModule } from 'src/app/shared/components/stepper/stepper.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { SummaryModule } from './components/summary/summary.module';
import { InvoiceModule } from './components/invoice/invoice.module';
import { EmitterModule } from './components/emitter/emitter.module';
import { TranslateModule } from '@ngx-translate/core';
import { BegoRadioCardModule } from 'src/app/shared/components/bego-radio-card/bego-radio-card.module';
import { PriceDetailsModule } from 'src/app/shared/components/price-details/price-details.module';
import { ButtonModule } from 'src/app/shared/components/button/button.module';


@NgModule({
  declarations: [
    CheckoutComponent,
  ],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    StepperModule,
    MatTabsModule,
    MatButtonModule,
    SummaryModule,
    InvoiceModule,
    TranslateModule,
    BegoRadioCardModule,
    PriceDetailsModule,
    EmitterModule,
    ButtonModule
  ]
})
export class CheckoutModule { }
