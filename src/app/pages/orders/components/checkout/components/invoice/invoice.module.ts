import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceComponent } from './invoice.component';
import { BegoTicketModule } from 'src/app/shared/components/bego-ticket/bego-ticket.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { BegoAddressAutocompleteModule } from 'src/app/shared/components/bego-address-autocomplete/bego-address-autocomplete.module';

@NgModule({
  declarations: [
    InvoiceComponent,
  ],
  imports: [
    CommonModule,
    BegoTicketModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    BegoPhoneInputModule,
    BegoAddressAutocompleteModule,
  ],
  exports: [
    InvoiceComponent,
  ]
})
export class InvoiceModule { }
