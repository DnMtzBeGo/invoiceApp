import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxPaginationModule } from 'ngx-pagination';
import { TextMaskModule } from 'angular2-text-mask';
import { TranslateModule } from '@ngx-translate/core';
import {
  MAT_COLOR_FORMATS,
  NgxMatColorPickerModule,
  NGX_MAT_COLOR_FORMATS,
} from '@angular-material-components/color-picker';
import { BegoIconsModule, BegoTableModule, BegoTableMultipleSelectionModule } from '@begomx/ui-components';

import { InvoiceRoutingModule } from './invoice-routing.module';
import {
  FacturasPageComponent,
  FacturaEditPageComponent,
  FacturaOrderEditPageComponent,
  CartaPortePageComponent,
} from './containers';
import { FacturaTableComponent } from './components';
import {
  ActionConfirmationComponent,
  ActionCancelarFacturaComponent,
  ActionSendEmailFacturaComponent,
  FacturaFiltersComponent,
} from './modals';
import { FacturaEmitterComponent } from './components/factura-emitter/factura-emitter.component';
import { EmisoresComponent } from './containers/emisores/emisores.component';
import { AereoComponent } from './components/invoice/carta-porte/aereo/aereo.component';
import { AutotransporteComponent } from './components/invoice/carta-porte/autotransporte/autotransporte.component';
import { FerroviarioComponent } from './components/invoice/carta-porte/ferroviario/ferroviario.component';
import { FiguraTransporteComponent } from './components/invoice/carta-porte/figura-transporte/figura-transporte.component';
import { FiguraComponent } from './components/invoice/carta-porte/figura-transporte/components/figura/figura.component';
import { MaritimoComponent } from './components/invoice/carta-porte/maritimo/maritimo.component';
import { TransporteComponent } from './components/invoice/carta-porte/transporte/transporte.component';
import { UbicacionesComponent } from './components/invoice/carta-porte/ubicaciones/ubicaciones.component';
import { UbicacionComponent } from './components/invoice/carta-porte/ubicaciones/components/ubicacion/ubicacion.component';
import { EmisoresTableComponent } from './components/emisores-table/emisores-table.component';
import { SeriesPageComponent } from './containers/series-page/series-page.component';
import { SeriesTableComponent } from './components/series-table/series-table.component';
import { SeriesNewComponent } from './components/series-new/series-new.component';
import { LocationComponent } from './components/location/location.component';
import { MultiplePaymentModalComponent } from './components/multiple-payment-modal/multiple-payment-modal.component';
import { BillsDialogComponent } from './components/multiple-payment-modal/bills-dialog/bills-dialog.component';
import { EditPaymentBillComponent } from './components/multiple-payment-modal/edit-payment-bill/edit-payment-bill.component';
// Services
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { TwoDigitDecimaNumberDirective } from '../shared/directives/decimal.directive';
import { TooltipHelpModule } from 'src/app/shared/components/tooltip-help/tooltip-help.module';
import { AppMaterialModule } from 'src/app/material';
import { RegimenesAduanerosComponent } from './components/invoice/carta-porte/regimenes-aduaneros/regimenes-aduaneros.component';
import { MercanciasTableComponent } from './components/invoice/carta-porte/mercanciasv2.0/components/mercancias-table/mercancias-table.component';
import { Mercanciasv20Component } from './components/invoice/carta-porte/mercanciasv2.0/mercanciasv2.0.component';
import { CommodityComponent } from './components/invoice/carta-porte/mercanciasv2.0/components/commodity/commodity.component';
import { CantidadTransportaComponent } from './components/invoice/carta-porte/mercanciasv2.0/components/cantidad-transporta/cantidad-transporta.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
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
    TransporteComponent,
    UbicacionesComponent,
    UbicacionComponent,
    CommodityComponent,
    CantidadTransportaComponent,
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
    TwoDigitDecimaNumberDirective,
    RegimenesAduanerosComponent,
    MultiplePaymentModalComponent,
    BillsDialogComponent,
    EditPaymentBillComponent,
    MercanciasTableComponent,
    Mercanciasv20Component,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
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
    AppMaterialModule,
    BegoTableMultipleSelectionModule,
  ],
  exports: [
    // MODALS
    ActionConfirmationComponent,
    ActionCancelarFacturaComponent,
    ActionSendEmailFacturaComponent,
    FacturaFiltersComponent,
    NgxMatColorPickerModule,
  ],
  providers: [{ provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS }, NotificationsService, DatePipe],
})
export class InvoiceModule {}
