import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolygonsComponent } from './polygons.component';
import { PolygonsRoutingModule } from './polygons-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbsModule } from 'src/app/shared/components/breadcrumbs/breadcrumbs.module';
import {
  BegoAlertModule,
  BegoIconsModule,
  BegoTableMultipleSelectionModule,
  BegoModalModule
} from '@begomx/ui-components';
import { CreatePolygonComponent } from './components/create-polygon/create-polygon.component';

@NgModule({
  declarations: [PolygonsComponent, CreatePolygonComponent],
  imports: [
    CommonModule,
    PolygonsRoutingModule,
    BegoIconsModule,
    BegoAlertModule,
    TranslateModule,
    BegoTableMultipleSelectionModule,
    BreadcrumbsModule,
    BegoModalModule
  ]
})
export class PolygonsModule { }
