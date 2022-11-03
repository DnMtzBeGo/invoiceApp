import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFilesComponent } from './upload-files.component';
import { DragFileBarModule } from 'src/app/shared/components/drag-file-bar/drag-file-bar.module';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [UploadFilesComponent],
  imports: [
    CommonModule,
    DragFileBarModule,
    ButtonModule,
    TranslateModule
  ],
  exports: [UploadFilesComponent]
})
export class UploadFilesModule { }
