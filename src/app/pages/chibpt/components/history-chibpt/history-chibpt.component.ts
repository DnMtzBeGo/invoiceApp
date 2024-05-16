import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-history-chibpt',
  templateUrl: './history-chibpt.component.html',
  styleUrls: ['./history-chibpt.component.scss']
})
export class HistoryChibptComponent implements OnInit {

  @Input() openHistoryChat: boolean = false;

  public lang:string = 'en';

  constructor(
    private translateService: TranslateService
  ) {
    this.lang = this.translateService.currentLang;
  }
  
  public ngOnInit():void {
  }

}
