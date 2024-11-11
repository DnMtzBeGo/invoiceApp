import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

  public isString(value: any): boolean {
    return typeof value === 'string';
  }

  public runCustomAction() {
    const { action } = this.data;
    if (action) {
      action();
    }
  }
}
