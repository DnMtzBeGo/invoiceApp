import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentComponent } from './payment.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    PaymentComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
  ],
  exports: [ 
    PaymentComponent,
  ]
})
export class PaymentModule { }
