import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SatCertificateComponent } from './sat-certificate.component';

const routes: Routes = [
  {
    path: '',
    component: SatCertificateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule]
})
export class SatCertificateRoutingModule { }
