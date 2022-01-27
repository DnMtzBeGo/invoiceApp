import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputSearchComponent } from './input-search.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    InputSearchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  exports: [
    InputSearchComponent
  ]
})

export class InputSearchModule { }
