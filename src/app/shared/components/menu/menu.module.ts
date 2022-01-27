import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { ButtonModule } from '../button/button.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    MenuComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    TranslateModule,
    MatIconModule,
  ],
  exports: [
    MenuComponent
  ]
})
export class MenuModule { }
