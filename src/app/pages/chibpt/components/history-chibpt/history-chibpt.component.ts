import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-history-chibpt',
  templateUrl: './history-chibpt.component.html',
  styleUrls: ['./history-chibpt.component.scss']
})
export class HistoryChibptComponent implements OnInit {

  public lang:string = 'en';
  public openHistoryChat: boolean = false;

  constructor(
    private translateService: TranslateService
  ) {
    this.lang = this.translateService.currentLang;
  }
  
  public ngOnInit():void {
  }

}
