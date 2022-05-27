import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history.component';
import { HistoryRoutingModule } from './history-routing.module';
import { OrdersListComponent } from './components/orders-list/orders-list.component';
import { OrderInfoComponent } from './components/order-info/order-info.component';
import { DriverStatusCardComponent } from './components/driver-status-card/driver-status-card.component';
import { DropDownModule } from '../../shared/components/drop-down/drop-down.module';
import { FormsModule } from '@angular/forms';
import { PickupDropoffInfoComponent } from './components/pickup-dropoff-info/pickup-dropoff-info.component';
import { PriceDetailsModule } from 'src/app/shared/components/price-details/price-details.module';
import { OrderEvidenceComponent } from './components/order-evidence/order-evidence.component';
import { TranslateModule } from '@ngx-translate/core';
import { OrderCardComponent } from './components/order-card/order-card.component';
import { MatTabsModule } from '@angular/material/tabs';
import { NoOrdersYetComponent } from './components/no-orders-yet/no-orders-yet.component';
import { MatButtonModule } from '@angular/material/button';
import { DownloadInvoicesComponent } from './components/download-invoices/download-invoices.component';
import { MatIconModule } from '@angular/material/icon';
import { EditCnBtnComponent } from './components/edit-cn-btn/edit-cn-btn.component';
import { EditOrderFleetComponent } from './components/edit-order-fleet/edit-order-fleet.component';
import { FleetAssetCardComponent } from './components/fleet-asset-card/fleet-asset-card.component';
import { CircularAvatarModule } from 'src/app/shared/components/circular-avatar/circular-avatar.module';
import { SimpleAvatarModule } from 'src/app/shared/components/simple-avatar/simple-avatar.module';

@NgModule({
  declarations: [
    HistoryComponent,
    OrdersListComponent,
    OrderInfoComponent,
    DriverStatusCardComponent,
    PickupDropoffInfoComponent,
    OrderEvidenceComponent,
    OrderCardComponent,
    NoOrdersYetComponent,
    DownloadInvoicesComponent,
    EditCnBtnComponent,
    EditOrderFleetComponent,
    FleetAssetCardComponent,
  ],
  imports: [
    CommonModule,
    HistoryRoutingModule,
    FormsModule,
    PriceDetailsModule,
    DropDownModule,
    TranslateModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    CircularAvatarModule,
    SimpleAvatarModule
  ]
})
export class HistoryModule { }
