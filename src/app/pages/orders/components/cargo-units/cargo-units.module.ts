import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoIncrementDecrementModule } from '@begomx/ui-components';

import { CargoUnitsComponent } from './cargo-units.component';

@NgModule({
  declarations: [CargoUnitsComponent],
  imports: [CommonModule, BegoIncrementDecrementModule],
  exports: [CargoUnitsComponent],
})
export class CargoUnitsModule {}
