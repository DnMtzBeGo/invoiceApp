import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagsFormComponent } from './tags-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BegoAlertModule, BegoTableModule, BegoTableMultipleSelectionModule } from '@begomx/ui-components';
import { AppMaterialModule } from 'src/app/material';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BegoTableModule,
    BegoTableMultipleSelectionModule,
    TranslateModule,
    AppMaterialModule,
    BegoAlertModule,
    MatSnackBarModule
  ],
  declarations: [TagsFormComponent]
})
export class TagsFormModule {}
