import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoTabComponent } from './bego-tabs.component';



@NgModule({
  declarations: [BegoTabComponent],
  imports: [
    CommonModule
  ],
  exports: [BegoTabComponent]
})
export class BegoTabsModule { }
