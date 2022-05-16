import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmitterComponent } from './emitter.component';
import { BegoTicketModule } from 'src/app/shared/components/bego-ticket/bego-ticket.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { InputDirectionsModule } from 'src/app/shared/components/input-directions/input-directions.module';

@NgModule({
  declarations: [
    EmitterComponent,
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
    InputDirectionsModule
  ],
  exports: [
    EmitterComponent,
  ]
})
export class EmitterModule { }
