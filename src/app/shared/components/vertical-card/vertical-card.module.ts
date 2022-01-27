import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerticalCardComponent } from './vertical-card.component';



@NgModule({
  declarations: [VerticalCardComponent],
  imports: [
    CommonModule
  ],
  exports: [VerticalCardComponent]
})
export class VerticalCardModule { }
