import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BegoIconsModule, BegoModalModule } from '@begomx/ui-components';
import { TranslateModule } from '@ngx-translate/core';

import { HomeRoutingModule } from './home-routing.module';
import { MapModule } from 'src/app/shared/components/map/map.module';
import { InputDirectionsModule } from 'src/app/shared/components/input-directions/input-directions.module';
import { HomeComponent } from './home.component';
import { OrdersModule } from '../orders/orders.module';
import { CheckoutModule } from '../orders/components/checkout/checkout.module';
import { ProfileModule } from '../profile/profile.module';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    TranslateModule,
    HomeRoutingModule,
    MapModule,
    InputDirectionsModule,
    OrdersModule,
    CheckoutModule,
    ProfileModule,
    AppMaterialModule,
    BegoModalModule,
    BegoIconsModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
