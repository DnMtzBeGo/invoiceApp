import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryComponent } from './summary.component';
import { BegoTicketModule } from 'src/app/shared/components/bego-ticket/bego-ticket.module';
import {MatButtonModule} from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';

@NgModule({
  declarations: [
    SummaryComponent,
  ],
  imports: [
    CommonModule,
    BegoTicketModule,
    MatButtonModule,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    BegoPhoneInputModule,
  ],
  exports:[
    SummaryComponent
  ]
})
export class SummaryModule { }
