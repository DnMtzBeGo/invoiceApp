import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { FirstColumnModule } from './components/first-column/first-column.module';
/* import { FirstColumnComponent } from './components/first-column/first-column.component'; */
import { ThirthColumnComponent } from './components/thirth-column/thirth-column.component';
import { SecondColumnComponent } from './components/second-column/second-column.component';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [ThirthColumnComponent, SecondColumnComponent],
  imports: [CommonModule, CalendarRoutingModule, FirstColumnModule, AppMaterialModule],
  exports: []
})
export class CalendarModule {}
