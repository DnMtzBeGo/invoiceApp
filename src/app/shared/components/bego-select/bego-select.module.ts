import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoSelectComponent } from './bego-select.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    BegoSelectComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
  ],
  exports: [
    BegoSelectComponent,
  ]
})
export class BegoSelectModule { }
