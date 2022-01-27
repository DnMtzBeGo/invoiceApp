import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitGoogleAddressPipe } from './split-google-address.pipe';
import { SplitGoogleAddressSecondPipe } from './split-google-address-second.pipe';


@NgModule({
  declarations: [
    SplitGoogleAddressPipe,
    SplitGoogleAddressSecondPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    SplitGoogleAddressPipe,
    SplitGoogleAddressSecondPipe
  ]
})
export class GoogleAddressModule { }
