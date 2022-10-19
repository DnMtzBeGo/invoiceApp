import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FleetPageComponent, FleetBrowserComponent } from './containers';

const routes: Routes = [
  {
    path: '',
    component: FleetPageComponent
  },
  {
    path: 'members',
    component: FleetBrowserComponent,
    data: {
      model: 'members'
    }
  },
  {
    path: 'trucks',
    component: FleetBrowserComponent,
    data: {
      model: 'trucks'
    }
  },
  {
    path: 'trailers',
    component: FleetBrowserComponent,
    data: {
      model: 'trailers'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetRoutingModule {}
