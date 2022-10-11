import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FleetComponent } from './fleet.component';

const routes: Routes = [
  {
    path: '',
    component: FleetComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetRoutingModule { }
