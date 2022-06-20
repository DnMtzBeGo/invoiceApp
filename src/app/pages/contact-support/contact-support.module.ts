import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ContactSupportRoutingModule } from './contact-support-routing.module';
import { ContactSupportComponent } from './contact-support.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatMessageModule } from 'src/app/shared/components/chat-message/chat-message.module';
import { BegoBodyModule } from 'src/app/shared/components/bego-body/bego-body.module';

@NgModule({
  declarations: [ContactSupportComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ContactSupportRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatTooltipModule,
    ChatMessageModule,
    BegoBodyModule
  ],
})
export class ContactSupportModule {}
