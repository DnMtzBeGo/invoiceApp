import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ContactSupportRoutingModule } from './contact-support-routing.module';
import { ContactSupportComponent } from './contact-support.component';
import { ChatMessageModule } from 'src/app/shared/components/chat-message/chat-message.module';
import { BegoBodyModule } from 'src/app/shared/components/bego-body/bego-body.module';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [ContactSupportComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ContactSupportRoutingModule,
    ChatMessageModule,
    BegoBodyModule,
    AppMaterialModule
  ]
})
export class ContactSupportModule {}
