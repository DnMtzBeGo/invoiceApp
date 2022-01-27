import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { DropDownComponent } from './drop-down.component';



@NgModule({
  declarations: [DropDownComponent],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatSelectModule,
  ],
  exports: [
    DropDownComponent
  ]
})
export class DropDownModule { }
