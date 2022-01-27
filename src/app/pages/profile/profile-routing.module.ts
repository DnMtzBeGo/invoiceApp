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
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }