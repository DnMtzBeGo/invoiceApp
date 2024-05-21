import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapDashboardComponent } from './map-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: MapDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapDashboardRoutingModule {}
