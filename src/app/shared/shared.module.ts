import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';

import { FacturaEmisorConceptosComponent, FacturaManageDireccionesComponent, InfoModalComponent } from 'src/app/pages/invoice/modals';
import { FacturaDireccionInputComponent } from 'src/app/pages/invoice/components';
import { CartaPorteInfoService } from 'src/app/pages/invoice/components/invoice/carta-porte/services/carta-porte-info.service';
import { BegoSliderDotsComponent } from 'src/app/shared/components/bego-slider-dots/bego-slider-dots.component';
import { BegoAddressAutocompleteModule } from 'src/app/shared/components/bego-address-autocomplete/bego-address-autocomplete.module';
import { PinComponent } from 'src/app/shared/components/pin/pin.component';
import { BegoInputFileComponent } from './components/bego-input-file/bego-input-file.component';

import { NotificationBarModule } from 'src/app/shared/components/notification-bar/notification-bar.module';
import { NotificationBarComponent } from 'src/app/shared/components/notification-bar/notification-bar.component';
import { UppercaseDirective } from 'src/app/pages/shared/directives/uppercase.directive';
import { AppMaterialModule } from '../material';

@NgModule({
  declarations: [
    FacturaEmisorConceptosComponent,
    FacturaManageDireccionesComponent,
    InfoModalComponent,
    FacturaDireccionInputComponent,
    BegoSliderDotsComponent,
    NotificationBarComponent,
    PinComponent,
    BegoInputFileComponent,
    UppercaseDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    NgxPaginationModule,
    BegoAddressAutocompleteModule,
    NotificationBarModule,
    AppMaterialModule
  ],
  exports: [
    FacturaEmisorConceptosComponent,
    FacturaManageDireccionesComponent,
    InfoModalComponent,
    FacturaDireccionInputComponent,
    BegoSliderDotsComponent,
    BegoAddressAutocompleteModule,
    //    NotificationBarModule,
    NotificationBarComponent,
    PinComponent,
    UppercaseDirective
  ],
  providers: [CartaPorteInfoService]
})
export class SharedModule {}
