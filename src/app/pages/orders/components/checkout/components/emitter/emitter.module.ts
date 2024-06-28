import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmitterComponent } from './emitter.component';
import { BegoTicketModule } from 'src/app/shared/components/bego-ticket/bego-ticket.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { BegoAddressAutocompleteModule } from 'src/app/shared/components/bego-address-autocomplete/bego-address-autocomplete.module';
import { AppMaterialModule } from 'src/app/material';
import { ButtonModule } from 'src/app/shared/components/button/button.module';

@NgModule({
  declarations: [EmitterComponent],
  imports: [
    CommonModule,
    BegoTicketModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    BegoPhoneInputModule,
    BegoAddressAutocompleteModule,
    AppMaterialModule,
    ButtonModule,
  ],
  exports: [EmitterComponent]
})
export class EmitterModule {}
