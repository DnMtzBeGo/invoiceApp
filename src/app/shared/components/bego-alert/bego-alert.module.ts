import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoAlertComponent } from './bego-alert.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    BegoAlertComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
  ],
  exports: [
    BegoAlertComponent,
  ]
})
export class BegoAlertModule { }
