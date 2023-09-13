import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
/* import { ShippersComponent } from './pages/shippers/shippers.component';
import { CarriersComponent } from './pages/carriers/carriers.component'; */
import { AboutComponent } from "./pages/about/about.component";
import { ContactComponent } from "./pages/contact/contact.component";

const routes: Routes = [
  {
    path: "home",
    loadChildren: () =>
      import("./pages/home/home.module").then((m) => m.HomeModule),
  },
  {
    path: "calendar",
    loadChildren: () =>
      import("./pages/calendar/calendar.module").then((m) => m.CalendarModule),
  },
  {
    path: "fleet",
    loadChildren: () =>
      import("./pages/fleet/fleet.module").then((m) => m.FleetModule),
  },
  /* {
    path: 'shippers',
    component: ShippersComponent,
    data: { animationState: 'Section' }
  },
  {
    path: 'carriers',
    component: CarriersComponent,
    data: { animationState: 'Section' }
  }, */
  { path: "about", component: AboutComponent },
  { path: "contact", component: ContactComponent },
  {
    path: "faq",
    loadChildren: () =>
      import("./pages/faq/faq.module").then((m) => m.FaqModule),
  },
  {
    path: 'drafts',
    loadChildren: () =>
      import('./pages/drafts/drafts.module').then((m) => m.DraftsModule)
  },
  {
    path: "profile",
    loadChildren: () =>
      import("./pages/profile/profile.module").then((m) => m.ProfileModule),
    // children: [
    //   {
    //     path: '',
    //     redirectTo: 'personal-info',
    //     pathMatch: 'full'
    //   },
    //   {
    //     path: 'personal-info',
    //     component: PersonalInfoComponent
    //   },
    //   {
    //     path: 'fiscal-documents',
    //     component: UploadFiscalDocsComponent
    //   }
    // ]
  },
  {
    path: "contact-support",
    loadChildren: () =>
      import("./pages/contact-support/contact-support.module").then(
        (m) => m.ContactSupportModule
      ),
  },
  { path: "", redirectTo: "payments", pathMatch: "full" },
  {
    path: "history",
    loadChildren: () =>
      import("./pages/history/history.module").then((m) => m.HistoryModule),
  },
  {
    path: "payments",
    loadChildren: () =>
      import("./pages/payments/payments.module").then((m) => m.PaymentsModule),
  },
  {
    path: "checkout",
    loadChildren: () =>
      import("./pages/orders/components/checkout/checkout.module").then(
        (m) => m.CheckoutModule
      ),
  },
  {
    path: "tracking",
    loadChildren: () =>
      import("./pages/tracking/tracking.module").then((m) => m.TrackingModule),
  },
  {
    path: "invoice",
    loadChildren: () =>
      import("./pages/invoice/invoice.module").then((m) => m.InvoiceModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
