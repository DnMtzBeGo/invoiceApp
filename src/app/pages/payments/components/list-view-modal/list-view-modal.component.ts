import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-list-view-modal',
  templateUrl: './list-view-modal.component.html',
  styleUrls: ['./list-view-modal.component.scss']
})
export class ListViewModalComponent implements OnInit {
  voucherAll: any = [];

  constructor(public dialogRef: MatDialogRef<ListViewModalComponent>, @Inject(MAT_DIALOG_DATA) dataVouchers: any) {
    console.log(dataVouchers, 'data');
    this.voucherAll = this.clearObject(dataVouchers);
    console.log(this.voucherAll);
  }

  ngOnInit(): void {}

  clearObject(objeto: Record<string, any>): Record<string, any> {
    for (const clave in objeto) {
      if (objeto[clave] === null || objeto[clave] === undefined) {
        delete objeto[clave];
      } else if (typeof objeto[clave] === 'object') {
        this.clearObject(objeto[clave]);
        if (Object.keys(objeto[clave]).length === 0) {
          delete objeto[clave];
        }
      } else if (Array.isArray(objeto[clave]) && objeto[clave].length === 0) {
        delete objeto[clave];
      }
    }
    return objeto;
  }

  close(edited: string = '') {
    this.dialogRef.close(edited);
  }
}
