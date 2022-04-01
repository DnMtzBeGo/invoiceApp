import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
// import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { NgxPaginationModule } from "ngx-pagination";
import { TextMaskModule } from "angular2-text-mask";
import { TranslateModule } from "@ngx-translate/core";

import { SharedModule } from "../../shared/shared.module";
// import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';

import { InvoiceRoutingModule } from "./invoice-routing.module";
import {
  //   OrdersPageComponent,
  //   EditionPageComponent,
  //   VariablesPageComponent,
  //   OrderDetailsPageComponent,
  //   AssignDriverPageComponent,
  FacturasPageComponent,
  //   FacturaEditPageComponent,
  //   CartaPortePageComponent,
  //   InvoicePageComponent,
} from "./containers";
import {
  //   OrderTableComponent,
  //   NewOrderComponent,
  //   CancelTableComponent,
  //   DraftTableComponent,
  //   OrderCheckoutComponent,
  //   RoutelessTableComponent,
  //   FirstStepComponent,
  //   SecondStepComponent,
  //   ThirdStepComponent,
  //   FourthStepComponent,
  //   FifthStepComponent,
  //   VariablesComponent,
  //   ChangeStatusComponent,
  //   AssignDriverComponent,
  //   DriverSelectionTableComponent,
  //   TruckSelectionTableComponent,
  //   TrailerSelectionTableComponent,
  //   RunAlgorithmComponent,
  FacturaTableComponent,
  //   InvoiceTableComponent,
} from "./components";
import {
  ActionConfirmationComponent,
  ActionCancelarFacturaComponent,
  ActionSendEmailFacturaComponent,
  // PushNotificationComponent,
  // AddNoteComponent,
  // FacturaEmisorConceptosComponent,
  // FacturaManageDireccionesComponent,
} from "./modals";
// import { FacturaEmitterComponent } from './components/factura-emitter/factura-emitter.component';
// import { EmisoresComponent } from './containers/emisores/emisores.component';
// import { CartaPortePageComponent } from './containers/carta-porte-page/carta-porte-page.component';
// import { AereoComponent } from './components/invoice/carta-porte/aereo/aereo.component';
// import { AutotransporteComponent } from './components/invoice/carta-porte/autotransporte/autotransporte.component';
// import { FerroviarioComponent } from './components/invoice/carta-porte/ferroviario/ferroviario.component';
// import { FiguraTransporteComponent } from './components/invoice/carta-porte/figura-transporte/figura-transporte.component';
// import { FiguraComponent } from './components/invoice/carta-porte/figura-transporte/components/figura/figura.component';
// import { MaritimoComponent } from './components/invoice/carta-porte/maritimo/maritimo.component';
// import { MercanciasComponent } from './components/invoice/carta-porte/mercancias/mercancias.component';
// import { TransporteComponent } from './components/invoice/carta-porte/transporte/transporte.component';
// import { UbicacionesComponent } from './components/invoice/carta-porte/ubicaciones/ubicaciones.component';
// import { UbicacionComponent } from './components/invoice/carta-porte/ubicaciones/components/ubicacion/ubicacion.component';
// import { CommodityComponent } from './components/commodity/commodity.component';
// import { EmisoresTableComponent } from './components/emisores-table/emisores-table.component';
// import { EmisoresEditPageComponent } from './containers/emisores-edit-page/emisores-edit-page.component';
// import { SeriesPageComponent } from './containers/series-page/series-page.component';
// import { SeriesEditPageComponent } from './containers/series-edit-page/series-edit-page.component';
// import { SeriesTableComponent } from './components/series-table/series-table.component';
// import { SeriesNewComponent } from './components/series-new/series-new.component';
// import { LocationModule } from './components/location/location.module';

@NgModule({
  declarations: [
    // OrdersPageComponent,
    // OrderTableComponent,
    // NewOrderComponent,
    // CancelTableComponent,
    // DraftTableComponent,
    // OrderCheckoutComponent,
    // EditionPageComponent,
    // RoutelessTableComponent,
    // FirstStepComponent,
    // SecondStepComponent,
    // ThirdStepComponent,
    // FourthStepComponent,
    // FifthStepComponent,
    // VariablesPageComponent,
    // VariablesComponent,
    // OrderDetailsPageComponent,
    // ChangeStatusComponent,
    // AssignDriverComponent,
    // AssignDriverPageComponent,
    // DriverSelectionTableComponent,
    // TruckSelectionTableComponent,
    // TrailerSelectionTableComponent,
    // RunAlgorithmComponent,
    FacturasPageComponent,
    // FacturaEditPageComponent,
    FacturaTableComponent,
    // FacturaEmitterComponent,
    // EmisoresComponent,
    // CartaPortePageComponent,
    // AereoComponent,
    // AutotransporteComponent,
    // FerroviarioComponent,
    // FiguraTransporteComponent,
    // FiguraComponent,
    // MaritimoComponent,
    // MercanciasComponent,
    // TransporteComponent,
    // UbicacionesComponent,
    // InvoicePageComponent,
    // InvoiceTableComponent,
    // UbicacionComponent,
    // CommodityComponent,
    // EmisoresTableComponent,
    // EmisoresEditPageComponent,
    // SeriesPageComponent,
    // SeriesEditPageComponent,
    // SeriesTableComponent,
    // SeriesNewComponent,
    // MODALS
    ActionConfirmationComponent,
    ActionCancelarFacturaComponent,
    ActionSendEmailFacturaComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    // NgxPermissionsModule,
    InvoiceRoutingModule,
    SharedModule,
    // AppMaterialModule,
    // CoreModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    // NgxMaterialTimepickerModule,
    TextMaskModule,
    NgxPaginationModule,
    // NgxMatColorPickerModule,
    // LocationModule,
  ],
  exports: [
    // MODALS
    ActionConfirmationComponent,
    ActionCancelarFacturaComponent,
    ActionSendEmailFacturaComponent,
  ],
  // providers: [{ provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }],
})
export class InvoiceModule {}
