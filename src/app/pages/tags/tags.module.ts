import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TagsComponent } from './tags.component';
import { TagsRoutingModule } from './tags-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { BegoTableModule, BegoTableMultipleSelectionModule } from '@begomx/ui-components';
import { AppMaterialModule } from 'src/app/material';
import { TagsFormModule } from './components/tags-form/tags-form.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    BegoTableModule,
    BegoTableMultipleSelectionModule,
    TagsRoutingModule,
    TagsFormModule,
    AppMaterialModule
  ],
  declarations: [TagsComponent],
  providers: [DatePipe]
})
export class TagsModule {}
