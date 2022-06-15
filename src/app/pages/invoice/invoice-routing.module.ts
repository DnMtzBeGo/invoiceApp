import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import {
  //   OrdersPageComponent,
  //   EditionPageComponent,
  //   VariablesPageComponent,
  //   OrderDetailsPageComponent,
  //   AssignDriverPageComponent,
  FacturasPageComponent,
  FacturaEditPageComponent,
  FacturaOrderEditPageComponent,
  //   InvoicePageComponent,
  EmisoresComponent,
  SeriesPageComponent,
  CartaPortePageComponent,
} from "./containers";

const routes: Routes = [
  { path: "", component: FacturasPageComponent },
  {
    path: "new",
    component: FacturaEditPageComponent,
    data: {
      model: "factura",
    },
  },
  {
    path: "new-template",
    component: FacturaEditPageComponent,
    data: {
      model: "template",
    },
  },
  {
    path: "edit",
    component: FacturaEditPageComponent,
    data: {
      model: "factura",
    },
  },
  {
    path: "edit-template",
    component: FacturaEditPageComponent,
    data: {
      model: "template",
    },
  },
  {
    path: "edit-order",
    component: FacturaOrderEditPageComponent,
  },
  { path: "carta-porte", component: CartaPortePageComponent },
  {
    path: "emisor",
    children: [
      { path: "", component: EmisoresComponent },
      { path: "serie", component: SeriesPageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
