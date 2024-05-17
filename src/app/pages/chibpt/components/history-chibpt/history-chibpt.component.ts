import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-history-chibpt',
  templateUrl: './history-chibpt.component.html',
  styleUrls: ['./history-chibpt.component.scss']
})
export class HistoryChibptComponent implements OnInit {
  @Input() openHistoryChat: boolean = false;

  public lang: string = 'en';

  public histories = [];
  public loading: boolean = false;

  constructor(private translateService: TranslateService, private apiRestService: AuthService) {
    this.lang = this.translateService.currentLang;
  }

  public async ngOnInit() {
    await this.getHistoryChat();
  }

  async getHistoryChat() {
    this.loading = true;
    (await this.apiRestService.apiRestGet(`assistant?limit=5&page=6`, { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result }) => {
        console.log(result);
        if (result?.result?.length) this.histories = result.result;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
