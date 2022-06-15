import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CircularAvatarComponent } from './circular-avatar.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [CircularAvatarComponent],
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  exports: [CircularAvatarComponent]
})
export class CircularAvatarModule { }
