import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: '',
        redirectTo: 'personal-info',
        pathMatch: 'full'
      },
      {
        path: 'personal-info',
        loadChildren: () => import('./components/personal-info/personal-info.module').then((m)=>m.PersonalInfoModule),
      },
      {
        path: 'fiscal-documents',
        loadChildren: () => import('./components/fiscal-docs/upload-fiscal-docs.module').then((m)=>m.UploadFiscalDocsModule),
      },
      {
        path: 'sat-certificate',
        loadChildren: () => import('./components/sat-certificate/sat-certificate.module').then((m)=>m.SatCertificateModule),
      },
      {
        path: 'history',
        loadChildren: () => import('./components/history/history.module').then((m)=>m.HistoryModule),
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }