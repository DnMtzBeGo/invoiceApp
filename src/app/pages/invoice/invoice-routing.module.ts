import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import {
  //   OrdersPageComponent,
  //   EditionPageComponent,
  //   VariablesPageComponent,
  //   OrderDetailsPageComponent,
  //   AssignDriverPageComponent,
  FacturasPageComponent,
  //   FacturaEditPageComponent,
  //   InvoicePageComponent,
  //   EmisoresComponent,
  //   SeriesPageComponent,
  //   SeriesEditPageComponent
} from "./containers";
// import { CartaPortePageComponent } from './containers/carta-porte-page/carta-porte-page.component';

const routes: Routes = [
  {
    path: "",
    children: [
      { path: "", component: FacturasPageComponent },
      //     {
      //       path: 'new',
      //       component: FacturaEditPageComponent,
      //       data: {
      //         model: 'factura',
      //       },
      //     },
      //     {
      //       path: 'new-template',
      //       component: FacturaEditPageComponent,
      //       data: {
      //         model: 'template',
      //       },
      //     },
      //     {
      //       path: 'edit',
      //       component: FacturaEditPageComponent,
      //       data: {
      //         model: 'factura',
      //       },
      //     },
      //     {
      //       path: 'edit-template',
      //       component: FacturaEditPageComponent,
      //       data: {
      //         model: 'template',
      //       },
      //     },
      //     { path: 'carta-porte', component: CartaPortePageComponent },
      //     { path: 'emisor',
      //       children: [
      //         { path: '', component: EmisoresComponent },
      //         { path: 'serie',
      //         children: [
      //           { path: '', component: SeriesPageComponent },
      //           { path: 'new', component: SeriesEditPageComponent },
      //         ]
      //         }
      //       ],
      //     },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
