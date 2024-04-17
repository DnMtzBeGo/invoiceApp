import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { DropDownComponent } from './drop-down.component';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [DropDownComponent],
  imports: [CommonModule, MatExpansionModule, AppMaterialModule],
  exports: [DropDownComponent]
})
export class DropDownModule {}
