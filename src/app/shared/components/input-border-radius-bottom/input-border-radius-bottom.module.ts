import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputBorderRadiusBottomComponent } from './input-border-radius-bottom.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';




@NgModule({
  declarations: [InputBorderRadiusBottomComponent],
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule
  ],
  exports: [InputBorderRadiusBottomComponent]
})
export class InputBorderRadiusBottomModule { }
