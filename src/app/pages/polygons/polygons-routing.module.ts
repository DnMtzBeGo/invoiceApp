import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PolygonsComponent } from './polygons.component';

const routes: Routes = [
  {
    path: '',
    component: PolygonsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PolygonsRoutingModule {}
