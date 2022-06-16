import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipHelpComponent } from './tooltip-help.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [TooltipHelpComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  exports: [TooltipHelpComponent]
})
export class TooltipHelpModule { }
