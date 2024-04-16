import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipHelpComponent } from './tooltip-help.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [TooltipHelpComponent],
  imports: [CommonModule, AppMaterialModule],
  exports: [TooltipHelpComponent]
})
export class TooltipHelpModule {}
