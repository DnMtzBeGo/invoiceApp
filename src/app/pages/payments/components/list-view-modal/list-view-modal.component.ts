import { Component, OnInit, Inject } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';
@Component({
  selector: 'app-list-view-modal',
  templateUrl: './list-view-modal.component.html',
  styleUrls: ['./list-view-modal.component.scss']
})
export class ListViewModalComponent implements OnInit {
  voucherAll: any = [];

  constructor(public dialogRef: MatDialogRef<ListViewModalComponent>, @Inject(MAT_DIALOG_DATA) dataVouchers: any) {
    const newObjectData = this.clearObject(dataVouchers);
    this.voucherAll = newObjectData;
  }

  ngOnInit(): void {}

  clearObject(data: { upfront_vouchers: any[]; vouchers: any[] }): any {
    const newObject = {};

    if (data.upfront_vouchers && data.upfront_vouchers.length > 0) {
      newObject['upfront_vouchers'] = data.upfront_vouchers.filter((voucher) => voucher !== null);
    }

    if (data.vouchers && data.vouchers.length > 0) {
      newObject['vouchers'] = data.vouchers.filter((voucher) => voucher !== null);
    }

    return newObject;
  }

  openNewTab(url: string): void {
    const newTab = window.open(url, '_blank');
    newTab?.focus();
  }

  close(edited: string = '') {
    this.dialogRef.close(edited);
  }
}
