import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomStepperComponent } from './custom-stepper.component';

@NgModule({
  declarations: [CustomStepperComponent],
  imports: [CommonModule],
  exports: [CustomStepperComponent],
})
export class CustomStepperModule {}
