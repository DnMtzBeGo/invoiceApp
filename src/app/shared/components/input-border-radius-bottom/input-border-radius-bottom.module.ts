import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputBorderRadiusBottomComponent } from './input-border-radius-bottom.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [InputBorderRadiusBottomComponent],
  imports: [CommonModule, FormsModule, AppMaterialModule],
  exports: [InputBorderRadiusBottomComponent]
})
export class InputBorderRadiusBottomModule {}
