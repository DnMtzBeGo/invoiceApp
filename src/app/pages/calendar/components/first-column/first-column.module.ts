import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstColumnComponent } from './first-column.component';


@NgModule({
  declarations: [
    FirstColumnComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FirstColumnComponent
  ]
})
export class FirstColumnModule { }
