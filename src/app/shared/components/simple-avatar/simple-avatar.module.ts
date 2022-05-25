import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleAvatarComponent } from './simple-avatar.component';



@NgModule({
  declarations: [SimpleAvatarComponent],
  imports: [
    CommonModule
  ],
  exports: [SimpleAvatarComponent]
})
export class SimpleAvatarModule { }
