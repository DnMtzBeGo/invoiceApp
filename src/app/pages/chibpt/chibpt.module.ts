import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChibptRoutingModule } from './chibpt-routing.module';
import { AppChibptComponent } from './app-chibpt.component';
import { AppChatChibptComponent } from './containers/app-chat-chibpt/app-chat-chibpt.component';
import { AppThreadsComponent } from './components/app-threads/app-threads.component';
import { AppFrecuentPrompsComponent } from './components/app-frecuent-promps/app-frecuent-promps.component';
import { AppUserMessageComponent } from './components/app-user-message/app-user-message.component';
import { AppChibibotMessageComponent } from './components/app-chibibot-message/app-chibibot-message.component';
import { BegoChatBoxModule, BegoIconsModule } from '@begomx/ui-components';
import { FileExtensionPipe } from 'src/app/shared/pipes/file-extension/file-extension.pipe';
import { HistoryChibptComponent } from './components/history-chibpt/history-chibpt.component';
import { AppMaterialModule } from 'src/app/material';
import { TranslateModule } from '@ngx-translate/core';
import { HistoryModalModule } from './components/history-chibpt/components/history-modal/history-modal.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
  declarations: [
    AppChibptComponent,
    AppChatChibptComponent,
    AppThreadsComponent,
    AppFrecuentPrompsComponent,
    AppUserMessageComponent,
    AppChibibotMessageComponent,
    FileExtensionPipe,
    HistoryChibptComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BegoChatBoxModule,
    ChibptRoutingModule,
    BegoIconsModule,
    AppMaterialModule,
    TranslateModule,
    HistoryModalModule,
    MatProgressSpinnerModule
  ]
})
export class ChibptModule {}
