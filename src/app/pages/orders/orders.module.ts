import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import {
  BegoAlertCustomerModule,
  BegoButtonModule,
  BegoButtonToggleModule,
  BegoCalendarTimeModule,
  BegoCheckoutCardModule,
  BegoDragDropModule,
  BegoIncrementDecrementModule,
  BegoInputIncrementDecrementModule,
  BegoLabelInputModule,
  BegoMarksModule,
  BegoPhoneCodeSelectModule,
  BegoRfcInputModule,
  BegoSearchSelectModule,
  BegoSelectItemModule,
  BegoSelectModule,
  BegoStepModule,
  BegoStepperModule,
  BegoTextAreaModule,
  BegoTextInputModule,
} from '@begomx/ui-components';
import { NgxCurrencyModule } from 'ngx-currency';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { Step1Component } from './components/step1/step1.component';
import { Step2Component } from './components/step2/step2.component';
import { Step3Component } from './components/step3/step3.component';
import { Step4Component } from './components/step4/step4.component';
import { PricingStepComponent } from './components/pricing-step/pricing-step.component';
import { OclStep1Component } from './components/ocl/step1/step1.component';
import { OclStep2Component } from './components/ocl/step2/step2.component';
import { DragFileBarModule } from 'src/app/shared/components/drag-file-bar/drag-file-bar.module';
import { StepperModule } from 'src/app/shared/components/stepper/stepper.module';
import { MomentDatePipe } from 'src/app/shared/pipes/momentDate/moment-date.pipe';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { CargoWeightComponent } from './components/cargo-weight/cargo-weight.component';
import { GoogleAddressModule } from 'src/app/shared/pipes/google-address/google-address.module';
import { ContinueModalComponent } from './components/continue-modal/continue-modal.component';
import { UnitDetailsModalComponent } from './components/unit-details-modal/unit-details-modal.component';
import { CargoUnitsComponent } from './components/cargo-units/cargo-units.component';
import { AppMaterialModule } from 'src/app/material';
import { SelectFleetModalComponent } from './components/select-fleet-modal/select-fleet-modal.component';
import { CircularAvatarModule } from 'src/app/shared/components/circular-avatar/circular-avatar.module';
import { CustomStepperComponent } from './components/custom-stepper/custom-stepper.component';

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    OrdersComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    OclStep1Component,
    OclStep2Component,
    MomentDatePipe,
    CargoWeightComponent,
    ContinueModalComponent,
    UnitDetailsModalComponent,
    CargoUnitsComponent,
    PricingStepComponent,
    SelectFleetModalComponent,
    CustomStepperComponent,
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CircularAvatarModule,
    // MatMomentDateModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule,
    DragFileBarModule,
    StepperModule,
    BegoPhoneInputModule,
    // MatDialogModule,
    GoogleAddressModule,
    NgxCurrencyModule,
    TimepickerModule.forRoot(),
    BegoStepperModule,
    BegoStepModule,
    BegoMarksModule,
    BegoLabelInputModule,
    BegoTextInputModule,
    BegoPhoneCodeSelectModule,
    BegoCalendarTimeModule,
    BegoButtonModule,
    BegoSearchSelectModule,
    BegoButtonToggleModule,
    BegoIncrementDecrementModule,
    BegoSelectModule,
    BegoSelectItemModule,
    BegoTextAreaModule,
    BegoDragDropModule,
    BegoAlertCustomerModule,
    BegoInputIncrementDecrementModule,
    BegoCheckoutCardModule,
    BegoRfcInputModule,
    AppMaterialModule,
    BegoPhoneCodeSelectModule,
  ],
  exports: [OrdersComponent],
  // providers: [
  //   {
  //     provide: DateAdapter,
  //     useClass: MomentDateAdapter,
  //     deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
  //   },

  //   {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  // ],
})
export class OrdersModule {}
