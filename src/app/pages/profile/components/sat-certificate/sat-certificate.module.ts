import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { DragFileBarModule } from 'src/app/shared/components/drag-file-bar/drag-file-bar.module';
import { SatCertificateComponent } from './sat-certificate.component';
import { MatInputModule } from '@angular/material/input';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { BegoAlertModule } from 'src/app/shared/components/bego-alert/bego-alert.module';
import { SatCertificateRoutingModule } from './sat-certificate-routing.module';


export function playerFactory() {
  return player;
}
@NgModule({
  declarations: [
    SatCertificateComponent
  ],
  imports: [
    CommonModule,
    SatCertificateRoutingModule,
    ButtonModule,
    BegoAlertModule,
    TranslateModule,
    MatInputModule,
    // DragFileBarModule,
    MatSelectModule,
    NgCircleProgressModule.forRoot({
      "maxPercent":100,
      "radius": 50,
      "space": -6,
      "outerStrokeWidth": 6,
      "innerStrokeWidth": 6,
      "outerStrokeColor": "#ffbe00",
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
export class SatCertificateModule { }
