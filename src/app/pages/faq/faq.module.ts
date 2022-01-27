import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FaqRoutingModule } from './faq-routing.module';
import { FaqComponent } from './faq.component';
import { DropDownModule } from 'src/app/shared/components/drop-down/drop-down.module';


@NgModule({
  declarations: [
    FaqComponent,
  ],
  imports: [
    CommonModule,
    FaqRoutingModule,
    DropDownModule,
  ]
})
export class FaqModule { }
