import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UploadFiscalDocsRoutingModule } from './upload-fiscal-docs-routing.module';
import { DragFileBarModule } from 'src/app/shared/components/drag-file-bar/drag-file-bar.module';
import { FiscalDocumentCardComponent } from './components/fiscal-document-card/fiscal-document-card.component';
import { UploadFiscalDocsComponent } from './upload-fiscal-docs.component';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';

import { MatButtonModule } from "@angular/material/button";
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { FiscalDocumentItemComponent } from './components/fiscal-document-item/fiscal-document-item.component';
import { BegoAlertModule } from 'src/app/shared/components/bego-alert/bego-alert.module';

export function playerFactory() {
  return player;
}
@NgModule({
  declarations: [
    FiscalDocumentCardComponent,
    FiscalDocumentItemComponent,
    UploadFiscalDocsComponent,
    ClickStopPropagationDirective,
  ],
  imports: [
    CommonModule,
    UploadFiscalDocsRoutingModule,
    MatButtonModule,
    ButtonModule,
    BegoAlertModule,
    TranslateModule,
    DragFileBarModule,
    MatSelectModule,
    NgCircleProgressModule.forRoot({
      "maxPercent":100,
      "radius": 50,
      "space": -6,
      "outerStrokeWidth": 6,
      "innerStrokeWidth": 6,
      "outerStrokeColor": "#FFE000",
      "innerStrokeColor": "#1e242b",
      "showSubtitle":false,
      "animation": true,
      "titleFontSize": "40px",
      "unitsFontSize": "20px",
      "showBackground": false,
      "clockwise": false,
      "startFromZero": false,}),
    LottieModule.forRoot({ player : playerFactory }),
  ],
  exports: [
  ]
})
export class UploadFiscalDocsModule { }
