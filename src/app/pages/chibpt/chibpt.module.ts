import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChibptRoutingModule } from './chibpt-routing.module';
import { AppChibptComponent } from './app-chibpt.component';
import { AppChatChibptComponent } from './containers/app-chat-chibpt/app-chat-chibpt.component';
import { AppThreadsComponent } from './components/app-threads/app-threads.component';
import { AppFrecuentPrompsComponent } from './components/app-frecuent-promps/app-frecuent-promps.component';
import { AppUserMessageComponent } from './components/app-user-message/app-user-message.component';
import { AppChibibotMessageComponent } from './components/app-chibibot-message/app-chibibot-message.component';
import { BegoChatBoxModule, BegoIconsModule } from '@begomx/ui-components';




@NgModule({
  declarations: [
    AppChibptComponent,
    AppChatChibptComponent,
    AppThreadsComponent,
    AppFrecuentPrompsComponent,
    AppUserMessageComponent,
    AppChibibotMessageComponent, 
    /*
    BegoIconsModule
    */
  ],
  imports: [
    CommonModule,
    ChibptRoutingModule,
    BegoIconsModule,
    FormsModule,
    BegoChatBoxModule
  ]
})
export class ChibptModule { }
