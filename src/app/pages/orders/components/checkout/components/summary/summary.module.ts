import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryComponent } from './summary.component';
import { BegoTicketModule } from 'src/app/shared/components/bego-ticket/bego-ticket.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [SummaryComponent],
  imports: [CommonModule, BegoTicketModule, TranslateModule, FormsModule, ReactiveFormsModule, BegoPhoneInputModule, AppMaterialModule],
  exports: [SummaryComponent]
})
export class SummaryModule {}
