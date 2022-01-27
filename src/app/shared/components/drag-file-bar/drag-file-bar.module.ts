import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragFileBarComponent } from './drag-file-bar.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    DragFileBarComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
  ],
  exports: [
    DragFileBarComponent,
  ]
})
export class DragFileBarModule { }
