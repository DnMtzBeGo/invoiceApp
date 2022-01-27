import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesComponent } from './services.component';
import { InsuranceModule } from './components/insurance/insurance.module';
import { CostumsAgentModule } from './components/costums-agent/costums-agent.module';
import { ServicesRoutingModule } from './services-routing.module';
import { SwiperModule } from "swiper/angular";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ServicesComponent
  ],
  imports: [
    CommonModule,
    ServicesRoutingModule,
    InsuranceModule,
    CostumsAgentModule,
    SwiperModule,
    TranslateModule
  ]
})
export class ServicesModule { }
