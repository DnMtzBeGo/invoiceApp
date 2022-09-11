import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ObserversModule } from '@angular/cdk/observers';

import { SatCertificateRoutingModule } from './sat-certificate-routing.module';
import { SatCertificateComponent } from './sat-certificate.component';
import { DragFileBarModule } from 'src/app/shared/components/drag-file-bar/drag-file-bar.module';

import { FiscalDocumentCardComponent } from './components/fiscal-document-card/fiscal-document-card.component';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { BegoAlertModule } from 'src/app/shared/components/bego-alert/bego-alert.module';

export function playerFactory() {
  return player;
}
@NgModule({
  declarations: [SatCertificateComponent, FiscalDocumentCardComponent],
  imports: [
    CommonModule,
    SatCertificateRoutingModule,
    ButtonModule,
    BegoAlertModule,
    TranslateModule,
    DragFileBarModule,
    ObserversModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgCircleProgressModule.forRoot({
      maxPercent: 100,
      radius: 50,
      space: -6,
      outerStrokeWidth: 6,
      innerStrokeWidth: 6,
      outerStrokeColor: '#ffbe00',
      innerStrokeColor: '#1e242b',
      showSubtitle: false,
      animation: true,
      titleFontSize: '40px',
      unitsFontSize: '20px',
      showBackground: false,
      clockwise: false,
      startFromZero: false
    }),
    LottieModule.forRoot({ player: playerFactory })
  ],
  exports: []
})
export class SatCertificateModule {}
