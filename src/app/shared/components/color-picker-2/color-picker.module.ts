import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoColorPicker } from './color-picker.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [BegoColorPicker],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [BegoColorPicker]
})
export class BegoColorPickerModule { }

