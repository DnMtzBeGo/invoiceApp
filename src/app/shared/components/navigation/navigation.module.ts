import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { TranslateModule } from '@ngx-translate/core';
import { WebMenuComponent } from './web-menu/web-menu.component';
import { WebMenuButtonComponent } from './web-menu-button/web-menu-button.component';
import { NavigationComponent } from './navigation.component';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    NavigationComponent,
    WebMenuComponent,
    WebMenuButtonComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    LottieModule.forRoot({ player: playerFactory })
  ],
  exports: [
    NavigationComponent
  ]
})
export class NavigationModule { }
