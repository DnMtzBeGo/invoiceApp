import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-bank-details-modal',
  templateUrl: './bank-details-modal.component.html',
  styleUrls: ['./bank-details-modal.component.scss']
})
export class BankDetailsModalComponent implements OnInit {

  data = {
    bank: "",
    account: "",
    swift: ""
  }

  constructor(public dialogRef: MatDialogRef<BankDetailsModalComponent>, @Inject(MAT_DIALOG_DATA) dataBank: any) { 
    this.data = {
      bank: dataBank?.bank,
      account: dataBank?.account,
      swift: dataBank?.swift
    }
  }

  ngOnInit(): void {
  }

  close(edited: string = '') {
    this.dialogRef.close(edited);
  }
}
