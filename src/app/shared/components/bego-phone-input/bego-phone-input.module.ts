import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoPhoneInputComponent } from './bego-phone-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TextMaskModule } from 'angular2-text-mask';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [BegoPhoneInputComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, TextMaskModule, FormsModule, AppMaterialModule],
  exports: [BegoPhoneInputComponent]
})
export class BegoPhoneInputModule {}
