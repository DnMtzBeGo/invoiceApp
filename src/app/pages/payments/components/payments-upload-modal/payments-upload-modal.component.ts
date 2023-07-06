import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CurrencyMaskConfig } from 'ngx-currency';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-payments-upload-modal',
  templateUrl: './payments-upload-modal.component.html',
  styleUrls: ['./payments-upload-modal.component.scss']
})
export class PaymentsUploadModalComponent implements OnInit {
  order_number: string = '';
  prices = { subtotal: 0, total: 0 };

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

  lang = {
    name: 'File Name',
    labelBrowse: 'Browse your file',
    labelOr: 'or',
    btnBrowse: 'Choose File',
    labelMax: 'max',
    uploading: 'Uploading...'
  };

  currencyOptions: CurrencyMaskConfig = {
    align: 'right',
    prefix: '$ ',
    thousands: ',',
    decimal: '.',
    precision: 2,
    allowNegative: false,
    suffix: ' MXN',
    allowZero: false,
    nullable: false
  };

  constructor(public dialogRef: MatDialogRef<PaymentsUploadModalComponent>, private webService: AuthService) {}

  ngOnInit(): void {}

  handleFileChange(file: File, type: 'pdf' | 'xml') {
    if (file == undefined) {
      this.files[type].data = undefined;
      this.files[type].file = null;
      return;
    }
    this.files[type].file = file;
    this.files[type].data = {
      name: file.name,
      date: new Date(file.lastModified),
      size: file.size
    };
    this.checkValidated();
  }

  onModelChange(value: number, type: 'total' | 'subtotal') {
    this.prices[type] = value;
    this.checkValidated();
  }

  checkValidated() {
    this.validated = Boolean(this.files.xml.file && this.order_number && this.prices.total > this.prices.subtotal);
  }

  async uploadData() {
    if (!this.validated) return;

    const formData = new FormData();

    formData.append('order_number', this.order_number);
    formData.append('files', this.files.xml.file);
    if (this.files.pdf.file) formData.append('files', this.files.pdf.file);
    formData.append('total', this.prices.total.toString());
    formData.append('subtotal', this.prices.subtotal.toString());

    (await this.webService.uploadFilesSerivce(formData, 'carriers_payments', { apiVersion: 'v1.1' })).subscribe({
      next: () => {
        this.close('success');
      },
      error: (err) => {
        this.close('failed');
        console.error(err);
      }
    });
  }

  close(edited: string = '') {
    this.dialogRef.close(edited);
  }
}
