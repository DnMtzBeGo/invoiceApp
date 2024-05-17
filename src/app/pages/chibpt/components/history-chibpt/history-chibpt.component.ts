import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HistoryModalComponent } from './components/history-modal/history-modal.component';

@Component({
  selector: 'app-history-chibpt',
  templateUrl: './history-chibpt.component.html',
  styleUrls: ['./history-chibpt.component.scss']
})
export class HistoryChibptComponent implements OnInit {
  @Output() selectedHistoryEmitter = new EventEmitter<string>();
  @Input() openHistoryChat: boolean = false;
  @ViewChild('renameInput') renameInput: ElementRef;
  public lang: string = 'en';

  public histories = [];
  public loading: boolean = false;

  auxName: string = '';

  constructor(
    private translateService: TranslateService,
    private apiRestService: AuthService,
    private matDialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.lang = this.translateService.currentLang;
  }

  public async ngOnInit() {
    await this.getHistoryChat();
  }

  async getHistoryChat() {
    this.loading = true;
    (await this.apiRestService.apiRestGet(`assistant?limit=20&page=1`, { apiVersion: 'v1.1', loader: false })).subscribe({
      next: ({ result }) => {
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

  async renameHistory(_id: string, index: number) {
    const requestJson = JSON.stringify({ name: this.auxName });

    (await this.apiRestService.apiRestPut(requestJson, `assistant/rename/${_id}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result }) => {
        console.log('renamed title: ', result);
        this.histories[index].title = this.auxName;
        this.histories[index].rename = false;
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {}
    });
  }

  cancelRename(index: number) {
    this.histories[index].rename = false;
    this.auxName = '';
  }

  activeRename(index: number) {
    this.histories.forEach((history) => (history['rename'] = false));
    this.histories[index]['rename'] = true;
    this.auxName = this.histories[index].title;
    setTimeout(() => {
      this.renameInput.nativeElement.focus();
    }, 0);
  }

  selectedHistory(_id: string, index: string) {
    this.histories.forEach((history) => (history['selected'] = false));
    this.histories[index]['selected'] = true;
    this.selectedHistoryEmitter.emit(_id);
  }

  openCloseModal(data, index: number) {
    const dialogRef = this.matDialog.open(HistoryModalComponent, {
      data,
      restoreFocus: false,
      backdropClass: ['brand-ui-dialog-2']
    });

    dialogRef.afterClosed().subscribe((deleted?) => {
      if (deleted) this.histories.splice(index, 1);
    });
  }
}
