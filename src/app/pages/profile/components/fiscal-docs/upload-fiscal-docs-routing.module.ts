import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import  { UploadFiscalDocsComponent } from './upload-fiscal-docs.component';

const routes: Routes = [
  {
    path: '',
    component: UploadFiscalDocsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule]
})
export class UploadFiscalDocsRoutingModule { }
