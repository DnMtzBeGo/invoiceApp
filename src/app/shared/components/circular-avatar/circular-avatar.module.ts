import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CircularAvatarComponent } from './circular-avatar.component';


@NgModule({
  declarations: [CircularAvatarComponent],
  imports: [
    CommonModule
  ],
  exports: [CircularAvatarComponent]
})
export class CircularAvatarModule { }
