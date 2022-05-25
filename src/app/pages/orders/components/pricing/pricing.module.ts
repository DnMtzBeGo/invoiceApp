import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingComponent } from './pricing.component';
import { NgxCurrencyModule } from "ngx-currency";
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PricingRoutingModule } from './pricing-routing.module';


@NgModule({
  declarations: [
    PricingComponent,
  ],
  imports: [
    CommonModule,
    NgxCurrencyModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    PricingRoutingModule
  ]
})
export class PricingModule { }
