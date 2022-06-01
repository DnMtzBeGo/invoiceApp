import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberCardSelectionComponent } from './member-card-selection.component';


@NgModule({
  declarations: [MemberCardSelectionComponent],
  imports: [
    CommonModule
  ],
  exports: [MemberCardSelectionComponent]
})
export class MemberCardSelectionModule { }
