import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsuranceComponent } from './insurance.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxCurrencyModule } from "ngx-currency";

@NgModule({
  declarations: [
    InsuranceComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    NgxCurrencyModule,
    ReactiveFormsModule
  ],
  exports: [
    InsuranceComponent
  ]
})
export class InsuranceModule { }
