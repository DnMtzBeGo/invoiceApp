import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerComponent } from './color-picker.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [ColorPickerComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [ColorPickerComponent]
})
export class ColorPickerModule { }
