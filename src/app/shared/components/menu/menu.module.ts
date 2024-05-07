import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { ButtonModule } from '../button/button.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { BegoIconsModule, BegoModalModule } from '@begomx/ui-components';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [MenuComponent],
  imports: [CommonModule, ButtonModule, TranslateModule, MatIconModule, BegoIconsModule, BegoModalModule, SharedModule],
  exports: [MenuComponent]
})
export class MenuModule {}
