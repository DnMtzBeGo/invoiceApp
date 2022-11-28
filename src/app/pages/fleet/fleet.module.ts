import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FleetRoutingModule } from './fleet-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

import { FleetPageComponent, FleetBrowserComponent } from './containers';

import { FleetWidgetComponent, MemberCardComponent, TruckCardComponent, TrailerCardComponent, FleetTableComponent } from './components';
import { FleetEditTruckComponent } from './containers/fleet-edit-truck/fleet-edit-truck.component';
import { BegoTabsModule } from 'src/app/shared/components/bego-tabs/bego-tabs.module';
import { ColorPickerModule } from 'src/app/shared/components/color-picker/color-picker.module';
import { UploadFilesModule } from './components/upload-files/upload-files.module';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { DragFileBarModule } from 'src/app/shared/components/drag-file-bar/drag-file-bar.module';
import { FleetEditTrailerComponent } from './containers/fleet-edit-trailer/fleet-edit-trailer.component';
import { PicturesGridComponent } from './components/pictures-grid/pictures-grid.component';
import { FleetInviteDriverComponent } from './containers/fleet-invite-driver/fleet-invite-driver.component';
import { BegoPhoneInputModule } from 'src/app/shared/components/bego-phone-input/bego-phone-input.module';

@NgModule({
  declarations: [FleetWidgetComponent, FleetPageComponent, FleetBrowserComponent, MemberCardComponent, TruckCardComponent, TrailerCardComponent, FleetEditTruckComponent,FleetTableComponent, FleetEditTrailerComponent, PicturesGridComponent, FleetInviteDriverComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FleetRoutingModule,
    TranslateModule,
    SharedModule,
    BegoTabsModule,
    ColorPickerModule,
    UploadFilesModule,
    ButtonModule,
    DragFileBarModule,
    BegoPhoneInputModule
  ]
})
export class FleetModule {}
