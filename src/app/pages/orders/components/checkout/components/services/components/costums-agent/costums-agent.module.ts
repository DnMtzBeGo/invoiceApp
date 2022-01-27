import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostumsAgentComponent } from './costums-agent.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [CostumsAgentComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MatRadioModule
  ],
  exports: [
    CostumsAgentComponent
  ]
})
export class CostumsAgentModule { }
