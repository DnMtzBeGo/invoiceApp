import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'invoice',
    loadChildren: () => import('./pages/invoice/invoice.module').then((m) => m.InvoiceModule)
  },
  { path: '', redirectTo: 'invoice', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
