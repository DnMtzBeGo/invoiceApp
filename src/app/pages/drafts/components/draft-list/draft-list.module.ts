import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraftListComponent } from './draft-list.component';
import { DateFormatterPipe } from 'src/app/shared/pipes/date-formatter/date-formatter.pipe';
import { ProgressBarModule } from 'src/app/shared/components/progress-bar/progress-bar.module';
import { InputSearchModule } from 'src/app/shared/components/input-search/input-search.module';
import { ButtonModule } from 'src/app/shared/components/button/button.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { AppMaterialModule } from 'src/app/material';

@NgModule({
  declarations: [DraftListComponent, DateFormatterPipe],
  imports: [CommonModule, ProgressBarModule, InputSearchModule, ButtonModule, InfiniteScrollModule, TranslateModule, AppMaterialModule],
  exports: [DraftListComponent]
})
export class DraftListModule {}
