import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceDetailsComponent } from './price-details.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    PriceDetailsComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
  ],
  exports: [
    PriceDetailsComponent
  ]
})
export class PriceDetailsModule { }
