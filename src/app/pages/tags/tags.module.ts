import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TagsComponent } from './tags.component';
import { TagsRoutingModule } from './tags-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { BegoAlertModule, BegoIconsModule, BegoTableModule, BegoTableMultipleSelectionModule } from '@begomx/ui-components';
import { AppMaterialModule } from 'src/app/material';
import { TagsFormModule } from './components/tags-form/tags-form.module';
import { SendMessageModalComponent } from './components/send-message-modal/send-message-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BegoModalModule } from '@begomx/ui-components';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    BegoTableModule,
    BegoTableMultipleSelectionModule,
    TagsRoutingModule,
    TagsFormModule,
    AppMaterialModule,
    MatDialogModule,
    ReactiveFormsModule,
    BegoAlertModule,
    BegoIconsModule,
    FormsModule,
    BegoModalModule
  ],
  declarations: [TagsComponent, SendMessageModalComponent],
  providers: [DatePipe]
})
export class TagsModule {}
