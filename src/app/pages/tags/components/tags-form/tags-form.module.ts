import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagsFormComponent } from './tags-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BegoAlertModule, BegoTableModule, BegoTableMultipleSelectionModule } from '@begomx/ui-components';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BegoTableModule,
    BegoTableMultipleSelectionModule,
    TranslateModule,
    AppMaterialModule,
    BegoAlertModule
  ],
  declarations: [TagsFormComponent]
})
export class TagsFormModule {}
