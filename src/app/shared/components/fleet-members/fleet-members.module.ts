import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetMembersComponent } from './fleet-members.component';


@NgModule({
  declarations: [FleetMembersComponent],
  imports: [
    CommonModule
  ],
  exports: [FleetMembersComponent]
})
export class FleetMembersModule { }
