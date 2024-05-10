import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChibptRoutingModule } from './chibpt-routing.module';
import { AppChibptComponent } from './app-chibpt.component';
import { AppChatChibptComponent } from './containers/app-chat-chibpt/app-chat-chibpt.component';
import { AppThreadsComponent } from './components/app-threads/app-threads.component';
import { AppFrecuentPrompsComponent } from './components/app-frecuent-promps/app-frecuent-promps.component';
import { AppUserMessageComponent } from './components/app-user-message/app-user-message.component';
import { AppChibibotMessageComponent } from './components/app-chibibot-message/app-chibibot-message.component';
import { HistoryChibptComponent } from './components/history-chibpt/history-chibpt.component';
import { BegoIconsModule } from '@begomx/ui-components';
import { AppMaterialModule } from 'src/app/material';
import { TranslateModule } from '@ngx-translate/core';




@NgModule({
  declarations: [
    AppChibptComponent,
    AppChatChibptComponent,
    AppThreadsComponent,
    AppFrecuentPrompsComponent,
    AppUserMessageComponent,
    AppChibibotMessageComponent,
    HistoryChibptComponent
  ],
  imports: [
    CommonModule,
    ChibptRoutingModule,
    BegoIconsModule,
    AppMaterialModule,
    TranslateModule
  ]
})
export class ChibptModule { }
