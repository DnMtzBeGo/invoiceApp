import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { MapModule } from 'src/app/shared/components/map/map.module';
import { InputDirectionsModule } from 'src/app/shared/components/input-directions/input-directions.module';
import { HomeComponent } from './home.component';
import { OrdersModule } from '../orders/orders.module';
import { MatTabsModule } from '@angular/material/tabs';
import { CheckoutModule } from '../orders/components/checkout/checkout.module';
import { ProfileModule } from '../profile/profile.module';
import { AppMaterialModule } from 'src/app/material';
import { BegoModalModule } from '@begomx/ui-components';
import { TranslateModule } from '@ngx-translate/core';
import { PolygonFilterModule } from './components/polygon-filter/polygon-filter.module';

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
    PolygonFilterModule
  ],
  exports: [HomeComponent]
})
export class HomeModule {}
