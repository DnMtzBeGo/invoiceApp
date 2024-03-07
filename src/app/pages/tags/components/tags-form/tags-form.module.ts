import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagsFormComponent } from './tags-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BegoTableModule, BegoTableMultipleSelectionModule } from '@begomx/ui-components';

@NgModule({
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    BegoTableModule,
    BegoTableMultipleSelectionModule,
    TranslateModule
  ],
  declarations: [TagsFormComponent]
})
export class TagsFormModule {}
