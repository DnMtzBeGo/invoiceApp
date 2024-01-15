import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DraftsRoutingModule } from './drafts-routing.module';
import { MapModule } from 'src/app/shared/components/map/map.module';
import { DraftsComponent } from './drafts.component';
import { DraftListModule } from './components/draft-list/draft-list.module';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { InputSearchModule } from 'src/app/shared/components/input-search/input-search.module';
import { TranslateModule } from '@ngx-translate/core';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [DraftsComponent],
  imports: [
    CommonModule,
    DraftsRoutingModule,
    MapModule,
    DraftListModule,
    ButtonModule,
    InputSearchModule,
    TranslateModule,
    AppMaterialModule
  ]
})
export class DraftsModule {}
