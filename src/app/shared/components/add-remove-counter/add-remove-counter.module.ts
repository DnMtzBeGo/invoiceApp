import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddRemoveCounterComponent } from './add-remove-counter.component';



@NgModule({
  declarations: [AddRemoveCounterComponent],
  imports: [
    CommonModule
  ],
  exports: [AddRemoveCounterComponent]
})
export class AddRemoveCounterModule { }
