import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { NavigationModule } from "./shared/components/navigation/navigation.module";
import { MenuModule } from "./shared/components/menu/menu.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

//translate imports
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { ProfileComponent } from "./pages/profile/profile.component";
/* import { ShippersComponent } from './pages/shippers/shippers.component';
import { DescriptionComponent } from './pages/shippers/description/description.component';
import { FeaturesComponent } from './pages/shippers/features/features.component';
import { CustomsAgentComponent } from './pages/shippers/customs-agent/customs-agent.component'; */
import { CarriersComponent } from "./pages/carriers/carriers.component";
import { DriverRolesComponent } from "./pages/carriers/driver-roles/driver-roles.component";
import { DriverFeaturesComponent } from "./pages/carriers/driver-features/driver-features.component";
import { DriverScreenshotsComponent } from "./pages/carriers/driver-screenshots/driver-screenshots.component";
import { AboutComponent } from "./pages/about/about.component";
import { WhoAreWeComponent } from "./pages/about/who-are-we/who-are-we.component";
import { GridComponent } from "./pages/about/grid/grid.component";
import { WhatWeDoComponent } from "./pages/about/what-we-do/what-we-do.component";
import { RoutesComponent } from "./pages/about/routes/routes.component";
import { InvestorsComponent } from "./pages/about/investors/investors.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { LottieModule } from "ngx-lottie";
import player from "lottie-web";
import { NgCircleProgressModule } from "ng-circle-progress";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { BegoAlertModule } from "./shared/components/bego-alert/bego-alert.module";
import { AuthInterceptor } from "./shared/interceptors/auth.interceptor";
import { TimeoutInterceptor } from "./shared/interceptors/timeout.interceptor";
import { CalendarComponent } from "./pages/calendar/calendar.component";
import { CalendarModule } from "./pages/calendar/calendar.module";
import { HorizontalCardComponent } from "./shared/components/horizontal-card/horizontal-card.component";
import { SharedModule } from "./shared/shared.module";
import { SmallResolutionModalComponent } from "./shared/components/small-resolution-modal/small-resolution-modal.component";
import { IncompatibleBrowserModalComponent } from "./shared/components/incompatible-browser-modal/incompatible-browser-modal.component";
// import { NotificationBarComponent } from "./shared/components/notification-bar/notification-bar.component";
// import { NotificationBarModule } from "./shared/components/notification-bar/notification-bar.module";

export function playerFactory() {
  return player;
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
@NgModule({
  declarations: [
    AppComponent,
    /* ShippersComponent, */
    /* DescriptionComponent, */
    /*     FeaturesComponent,
    CustomsAgentComponent, */
    CarriersComponent,
    DriverRolesComponent,
    DriverFeaturesComponent,
    DriverScreenshotsComponent,
    AboutComponent,
    WhoAreWeComponent,
    GridComponent,
    WhatWeDoComponent,
    RoutesComponent,
    InvestorsComponent,
    ContactComponent,
    FooterComponent,
    CalendarComponent,
    HorizontalCardComponent,
    SmallResolutionModalComponent,
    IncompatibleBrowserModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    NgCircleProgressModule.forRoot({
      maxPercent: 100,
      radius: 50,
      space: -6,
      outerStrokeWidth: 6,
      innerStrokeWidth: 6,
      outerStrokeColor: "#ffbe00",
      innerStrokeColor: "#1e242b",
      showSubtitle: false,
      animation: true,
      titleFontSize: "40px",
      unitsFontSize: "20px",
      showBackground: false,
      clockwise: false,
      startFromZero: false,
    }),
    NavigationModule,
    MenuModule,
    BegoAlertModule,
    BrowserAnimationsModule,
    MatSelectModule,
    LottieModule.forRoot({ player: playerFactory }),
    CalendarModule,
    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
