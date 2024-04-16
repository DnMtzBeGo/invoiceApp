import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirstColumnComponent } from './first-column.component';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [FirstColumnComponent],
  imports: [CommonModule],
  exports: [FirstColumnComponent, AppMaterialModule]
})
export class FirstColumnModule {}
