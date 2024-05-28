import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FleetBrowserComponent, FleetInviteDriverComponent } from './containers';
import { FleetEditPrimeComponent } from './containers/fleet-edit-prime/fleet-edit-prime.component';
import { FleetEditTrailerComponent } from './containers/fleet-edit-trailer/fleet-edit-trailer.component';
import { FleetEditTruckComponent } from './containers/fleet-edit-truck/fleet-edit-truck.component';

const routes: Routes = [
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
    path: 'trucks/edit',
    component: FleetEditTruckComponent
  },
  {
    path: 'trailers/new',
    component: FleetEditTrailerComponent
  },
  {
    path: 'trailers/edit',
    component: FleetEditTrailerComponent
  },
  {
    path: 'trailers',
    component: FleetBrowserComponent,
    data: {
      model: 'trailers'
    }
  },
  {
    path: 'members/new',
    component: FleetInviteDriverComponent,
    data: {
      model: 'members/new'
    }
  },
  {
    path: 'prime',
    children: [
      { path: '', component: FleetBrowserComponent, data: { model: 'primeList' } },
      { path: 'new', component: FleetEditPrimeComponent },
      { path: 'edit', component: FleetEditPrimeComponent },
      { path: ':id', component: FleetBrowserComponent, data: { model: 'prime' } }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetRoutingModule {}
