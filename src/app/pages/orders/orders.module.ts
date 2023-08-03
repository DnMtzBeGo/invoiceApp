import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

import { OrdersRoutingModule } from "./orders-routing.module";
import { OrdersComponent } from "./orders.component";

import { Step1Component } from "./components/step1/step1.component";
import { Step2Component } from "./components/step2/step2.component";
import { Step3Component } from "./components/step3/step3.component";
import { Step4Component } from "./components/step4/step4.component";

import { DragFileBarModule } from "src/app/shared/components/drag-file-bar/drag-file-bar.module";
import { StepperModule } from "src/app/shared/components/stepper/stepper.module";

import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MomentDatePipe } from "src/app/shared/pipes/momentDate/moment-date.pipe";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MatNativeDateModule,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { BegoPhoneInputModule } from "src/app/shared/components/bego-phone-input/bego-phone-input.module";
import { CargoWeightComponent } from "./components/cargo-weight/cargo-weight.component";
import { MatDialogModule } from "@angular/material/dialog";
import { GoogleAddressModule } from "src/app/shared/pipes/google-address/google-address.module";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { InputSelectableComponent } from './components/input-selectable/input-selectable.component';
import { ContinueModalComponent } from './components/continue-modal/continue-modal.component';
import { UnitDetailsModalComponent } from './components/unit-details-modal/unit-details-modal.component';
import {
  BegoButtonModule,
  BegoButtonToggleModule,
  BegoCalendarTimeModule,
  BegoDragDropModule,
  BegoIncrementDecrementModule,
  BegoLabelInputModule,
  BegoMarksModule,
  BegoPhoneCodeSelectModule,
  BegoSearchSelectModule,
  BegoSelectItemModule,
  BegoSelectModule,
  BegoStepModule,
  BegoStepperModule,
  BegoTextAreaModule,
  BegoTextInputModule,
} from "@begomx/ui-components";

export const MY_FORMATS = {
  parse: {
    dateInput: "LL",
  },
  display: {
    dateInput: "LL",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@NgModule({
  declarations: [
    OrdersComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    MomentDatePipe,
    CargoWeightComponent,
    InputSelectableComponent,
    ContinueModalComponent,
    UnitDetailsModalComponent,
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    MatTabsModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonToggleModule,
    MatInputModule,
    MatDatepickerModule,
    // MatMomentDateModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule,
    DragFileBarModule,
    StepperModule,
    MatSelectModule,
    MatButtonModule,
    BegoPhoneInputModule,
    MatDialogModule,
    GoogleAddressModule,
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
