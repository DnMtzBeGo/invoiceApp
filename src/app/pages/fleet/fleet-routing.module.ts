import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FleetPageComponent, FleetBrowserComponent } from './containers';
import { FleetEditTrailerComponent } from './containers/fleet-edit-trailer/fleet-edit-trailer.component';
import { FleetEditTruckComponent } from './containers/fleet-edit-truck/fleet-edit-truck.component';

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
    path: 'trucks/new',
    component: FleetEditTruckComponent
  },
  {
    path: 'trucks/edit/:id',
    component: FleetEditTruckComponent
  },
  {
    path: 'trailers/new',
    component: FleetEditTrailerComponent
  },
  {
    path: 'trailers/edit/:id',
    component: FleetEditTrailerComponent
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
