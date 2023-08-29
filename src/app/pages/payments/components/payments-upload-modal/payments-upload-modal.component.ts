import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyMaskConfig } from 'ngx-currency';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { EditedModalComponent } from '../edited-modal/edited-modal.component';

@Component({
  selector: 'app-payments-upload-modal',
  templateUrl: './payments-upload-modal.component.html',
  styleUrls: ['./payments-upload-modal.component.scss']
})
export class PaymentsUploadModalComponent implements OnInit {
  order_number: string = '';
  reference_number: string = '';
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
  xmlType = ['.xml'];
  pdfType = ['.pdf'];

  currencyOptions: CurrencyMaskConfig = {
    align: 'right',
    prefix: '$ ',
    thousands: ',',
    decimal: '.',
    precision: 2,
    allowNegative: false,
    suffix: '',
    allowZero: false,
    nullable: false
  };
  bgoOptions = {
    mask: [
      'B',
      'G',
      'O',
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      '-',
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/
    ],
    placeholderChar: ' '
  };
  bgoPattern: RegExp = /^BGO\d{11}-\d{6}$/;

  lang: string = 'es';

  public foreingPayment: boolean = false;
  public currency: string = '';

  constructor(
    public dialogRef: MatDialogRef<PaymentsUploadModalComponent>,
    private webService: AuthService,
    private translateService: TranslateService,
    private notificationsService: NotificationsService,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || 'en';
  }

  async handleFileChange(file: File, type: 'pdf' | 'xml') {
    if (file == undefined) {
      this.files[type].data = undefined;
      this.files[type].file = null;
      return;
    }
    // if (type == 'xml') {
    //   (await this.webService.apiRestGet('endpoint', { apiVersion: 'v1.1' })).subscribe(
    //     (res) => {
    //       if(res == 'MXN') {
    //         this.currency = 'MXN';
    //       } else {
    //         this.currency = 'USD';
    //       }
    //     },
    //     (err) => {
    //       console.log(err);
    //     }
    //   );
    // }

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

  onForeignPaymentChange(value: Object) {
    if(Boolean(value["enabled"])) {
      this.foreingPayment = true;
    } else {
      this.foreingPayment = false;
    }
  }

  checkValidated() {
    this.validated = Boolean(
      this.files.xml.file &&
        this.files.pdf.file &&
        this.order_number &&
        this.prices.total > this.prices.subtotal &&
        this.reference_number &&
        this.bgoPattern.test(this.reference_number)
    );
  }

  async uploadData() {
    if (!this.validated) return;

    const formData = new FormData();

    formData.append('order_number', this.order_number);
    formData.append('reference_number', this.reference_number);
    formData.append('files', this.files.xml.file);
    if (this.files.pdf.file) formData.append('files', this.files.pdf.file);
    formData.append('total', this.prices.total.toString());
    formData.append('subtotal', this.prices.subtotal.toString());

    (await this.webService.uploadFilesSerivce(formData, 'carriers_payments', { apiVersion: 'v1.1' })).subscribe({
      next: () => {
        this.close('success');
      },
      error: ({ error: { error } }) => {
        const { validationErrors, message } = error;
        this.errorAlert(error.hasOwnProperty('validationErrors') ? validationErrors[0].message[this.lang] : message[this.lang]);
      }
    });
  }

  errorAlert(subtitle) {
    const dialogRef = this.matDialog.open(EditedModalComponent, {
      data: { title: this.translateService.instant('checkout.alerts.error-something'), subtitle },
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1', 'no-padding', 'full-visible']
    });
  }

  invalidFile() {
    this.notificationsService.showErrorToastr(this.translate('invalid-file', 'upload-modal'));
  }

  translate(word: string, type: string) {
    return this.translateService.instant(`payments.${type}.${word}`);
  }

  close(edited: string = '') {
    this.dialogRef.close(edited);
  }
}
