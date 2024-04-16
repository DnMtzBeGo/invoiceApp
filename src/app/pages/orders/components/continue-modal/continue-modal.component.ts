import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-continue-modal',
  templateUrl: './continue-modal.component.html',
  styleUrls: ['./continue-modal.component.scss']
})
export class ContinueModalComponent implements OnInit {
  public title;
  public items: string[] = [];

  public translateList = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data, translateService: TranslateService) {
    this.translateList = translateService.instant('orders.continue-modal-list');
  }

  ngOnInit(): void {
    this.title = this.data.title;
    console.log('CONTINUE:', this.data.list);
    if (this.data.list.length > 0) {
      for (const field of this.data.list) {
        this.items.push(this.translateList[field]);
      }
    }
  }
}
