import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-payments-upload-modal',
  templateUrl: './payments-upload-modal.component.html',
  styleUrls: ['./payments-upload-modal.component.scss']
})
export class PaymentsUploadModalComponent implements OnInit {
  lang = {
    name: 'File Name',
    labelBrowse: 'Browse your file',
    labelOr: 'or',
    btnBrowse: 'Choose File',
    labelMax: 'max',
    uploading: 'Uploading...'
  };

  files = {
    pdf: {
      file: null,
      data: null
    },
    xml: {
      file: null,
      data: null
    }
  };

  validated: boolean = false;

  amount: number;
  formattedAmount: string;

  constructor(public dialogRef: MatDialogRef<PaymentsUploadModalComponent>) {}

  ngOnInit(): void {}

  handleFileChange(file: File, type: 'pdf' | 'xml') {
    if (file == undefined) {
      this.files[type].data = undefined;
      return;
    }
    this.files[type].data = {
      name: file.name,
      date: new Date(file.lastModified),
      size: file.size
    };
  }

  formatCurrency() {
    this.formattedAmount = this.amount.toFixed(2);
  }

  parseCurrency() {
    this.amount = parseFloat(this.formattedAmount.replace(/[^0-9.]/g, ''));
  }
}
