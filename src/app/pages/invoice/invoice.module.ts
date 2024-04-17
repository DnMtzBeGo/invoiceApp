import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxPaginationModule } from 'ngx-pagination';
import { TextMaskModule } from 'angular2-text-mask';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';
import { MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS } from '@angular-material-components/color-picker';

import { InvoiceRoutingModule } from './invoice-routing.module';
import {
  //   OrdersPageComponent,
  //   EditionPageComponent,
  //   VariablesPageComponent,
  //   OrderDetailsPageComponent,
  //   AssignDriverPageComponent,
  FacturasPageComponent,
  FacturaEditPageComponent,
  FacturaOrderEditPageComponent,
  CartaPortePageComponent
  //   InvoicePageComponent,
} from './containers';
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
  FacturaTableComponent
  //   InvoiceTableComponent,
} from './components';
import {
  ActionConfirmationComponent,
  ActionCancelarFacturaComponent,
  ActionSendEmailFacturaComponent,
  FacturaFiltersComponent
  // PushNotificationComponent,
  // AddNoteComponent
} from './modals';
import { FacturaEmitterComponent } from './components/factura-emitter/factura-emitter.component';
import { EmisoresComponent } from './containers/emisores/emisores.component';
import { AereoComponent } from './components/invoice/carta-porte/aereo/aereo.component';
import { AutotransporteComponent } from './components/invoice/carta-porte/autotransporte/autotransporte.component';
import { FerroviarioComponent } from './components/invoice/carta-porte/ferroviario/ferroviario.component';
import { FiguraTransporteComponent } from './components/invoice/carta-porte/figura-transporte/figura-transporte.component';
import { FiguraComponent } from './components/invoice/carta-porte/figura-transporte/components/figura/figura.component';
import { MaritimoComponent } from './components/invoice/carta-porte/maritimo/maritimo.component';
import { MercanciasComponent } from './components/invoice/carta-porte/mercancias/mercancias.component';
import { TransporteComponent } from './components/invoice/carta-porte/transporte/transporte.component';
import { UbicacionesComponent } from './components/invoice/carta-porte/ubicaciones/ubicaciones.component';
import { UbicacionComponent } from './components/invoice/carta-porte/ubicaciones/components/ubicacion/ubicacion.component';
import { CommodityComponent } from './components/commodity/commodity.component';
import { EmisoresTableComponent } from './components/emisores-table/emisores-table.component';
import { SeriesPageComponent } from './containers/series-page/series-page.component';
import { SeriesTableComponent } from './components/series-table/series-table.component';
import { SeriesNewComponent } from './components/series-new/series-new.component';
import { LocationComponent } from './components/location/location.component';

// Services
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { TwoDigitDecimaNumberDirective } from '../shared/directives/decimal.directive';
import { TooltipHelpModule } from 'src/app/shared/components/tooltip-help/tooltip-help.module';
import { BegoIconsModule, BegoTableModule } from '@begomx/ui-components';
import { AppMaterialModule } from 'src/app/material';
import { CantidadTransportaComponent } from './components/cantidad-transporta/cantidad-transporta.component';

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
    FacturaEditPageComponent,
    FacturaOrderEditPageComponent,
    FacturaTableComponent,
    FacturaEmitterComponent,
    EmisoresComponent,
    CartaPortePageComponent,
    AereoComponent,
    AutotransporteComponent,
    FerroviarioComponent,
    FiguraTransporteComponent,
    FiguraComponent,
    MaritimoComponent,
    MercanciasComponent,
    TransporteComponent,
    UbicacionesComponent,
    UbicacionComponent,
    CommodityComponent,
    CantidadTransportaComponent,
    // InvoicePageComponent,
    // InvoiceTableComponent,
    EmisoresTableComponent,
    SeriesPageComponent,
    SeriesTableComponent,
    SeriesNewComponent,
    LocationComponent,
    // MODALS
    ActionConfirmationComponent,
    ActionCancelarFacturaComponent,
    ActionSendEmailFacturaComponent,
    FacturaFiltersComponent,
    TwoDigitDecimaNumberDirective
  ],
  imports: [
    CommonModule,
    TranslateModule,
    // NgxPermissionsModule,
    InvoiceRoutingModule,
    SharedModule,
    // CoreModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaterialTimepickerModule,
    TextMaskModule,
    NgxPaginationModule,
    NgxMatColorPickerModule,
    TooltipHelpModule,
    BegoIconsModule,
    BegoTableModule,
    AppMaterialModule
  ],
  exports: [
    // MODALS
    ActionConfirmationComponent,
    ActionCancelarFacturaComponent,
    ActionSendEmailFacturaComponent,
    FacturaFiltersComponent,
    NgxMatColorPickerModule
  ],
  providers: [{ provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }, NotificationsService, DatePipe]
})
export class InvoiceModule {}
