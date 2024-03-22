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

  valuesInputs = {
    subtotal: {
      inputValue: '',
      originalValue: ''
    },
    total: {
      inputValue: '',
      originalValue: ''
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
    const formData = new FormData();
    formData.append('file', file);

    if (file == undefined) {
      this.files[type].data = undefined;
      this.files[type].file = null;
      if (type == 'xml') {
        this.currency = '';
        this.changeRenderInput('subtotal');
        this.changeRenderInput('total');
      }
      this.checkValidated();
      return;
    }
    this.files[type].file = file;
    this.files[type].data = {
      name: file.name,
      date: new Date(file.lastModified),
      size: file.size
    };

    if (type == 'xml') {
      (await this.webService.uploadFilesSerivce(formData, 'carriers_payments/check_currency', { apiVersion: 'v1.1' })).subscribe(
        (res) => {
          if (Object.keys(res).length > 0) {
            this.currency = res['result'];
          } else {
            this.currency = '';
          }
          this.changeRenderInput('subtotal');
          this.changeRenderInput('total');
          this.checkValidated();
        },
        (err) => {
          console.log(err);
        }
      );
    }

    this.checkValidated();
  }

  onModelChange(value: number, type: 'total' | 'subtotal') {
    this.prices[type] = value;
    this.checkValidated();
  }

  onForeignPaymentChange(value: Object) {
    if (Boolean(value['enabled'])) {
      this.foreingPayment = true;
    } else {
      this.foreingPayment = false;
    }
    this.checkValidated();
  }

  checkValidated() {
    this.order_number.toUpperCase();
    if (this.foreingPayment) {
      this.validated = Boolean(
        this.files.pdf.file &&
          this.order_number &&
          this.prices.total >= this.prices.subtotal &&
          this.reference_number &&
          this.bgoPattern.test(this.reference_number)
      );
    } else {
      if (this.currency) {
        if (this.currency === 'USD')
          this.validated = Boolean(
            this.files.xml.file &&
              this.files.pdf.file &&
              this.order_number &&
              this.prices.total >= this.prices.subtotal &&
              this.prices.subtotal > 0 &&
              this.reference_number &&
              this.bgoPattern.test(this.reference_number)
          );
        if (this.currency === 'MXN')
          this.validated = Boolean(
            this.files.xml.file &&
              this.files.pdf.file &&
              this.order_number &&
              this.prices.total >= this.prices.subtotal &&
              this.prices.subtotal > 0 &&
              this.reference_number &&
              this.bgoPattern.test(this.reference_number)
          );
      } else {
        this.validated = false;
      }
    }
  }

  async uploadData() {
    if (!this.validated) return;

    const formData = new FormData();

    formData.append('order_number', this.order_number);
    formData.append('reference_number', this.reference_number);
    if (this.files.xml.file) formData.append('files', this.files.xml.file);
    if (this.files.pdf.file) formData.append('files', this.files.pdf.file);
    formData.append('total', this.prices.total.toString());
    formData.append('subtotal', this.prices.subtotal.toString());
    formData.append('foreign_payment', this.foreingPayment.toString());

    (await this.webService.uploadFilesSerivce(formData, 'carriers_payments', { apiVersion: 'v1.1' })).subscribe({
      next: () => {
        this.close('success');
      },
      error: ({ error: { error } }) => {
        const { errors, message } = error;
        this.errorAlert(error.message[this.lang]);
      }
    });
  }

  onInputChange(event: Event, type: 'total' | 'subtotal') {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
    const regex = /^\d+(\.\d{0,2})?$/;
    if (inputValue === undefined || inputValue === null || inputValue.trim() === '') {
      inputElement.value = '';
      this.valuesInputs[type].inputValue = '';
      return;
    }
    if (!regex.test(inputValue)) {
      if (!regex.test(this.valuesInputs[type].inputValue)) {
        const clearValue = this.valuesInputs[type].inputValue.replace(/[^0-9.]/g, '');
        if (!clearValue) {
          this.valuesInputs[type].inputValue = '00';
          this.prices[type] = parseFloat(this.valuesInputs[type].inputValue) || 0;
          this.checkValidated();
          return;
        }
        const valueFloat = parseFloat(clearValue);
        const valueRounded = valueFloat.toFixed(2);
        const formattedValue = valueRounded.replace(/\.00$/, '');
        this.valuesInputs[type].inputValue = formattedValue;
        inputElement.value = this.valuesInputs[type].inputValue || '';
        this.prices[type] = parseFloat(this.valuesInputs[type].inputValue) || 0;
        this.checkValidated();
      } else {
        inputElement.value = this.valuesInputs[type].inputValue || '';
        this.prices[type] = parseFloat(this.valuesInputs[type].inputValue) || 0;
        this.checkValidated();
      }
    } else {
      this.valuesInputs[type].inputValue = inputValue;
      this.prices[type] = parseFloat(inputValue) || 0;
      this.checkValidated();
    }
  }

  onInputBlur(event: Event, type: 'total' | 'subtotal') {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
    if (inputValue === '') {
      inputValue = '0.00';
    }
    if (inputValue !== this.valuesInputs[type].originalValue) {
      const formattedValue = this.formatNumberWithCommasAndDecimals(inputValue);
      inputElement.value = formattedValue;
      this.valuesInputs[type].originalValue = inputElement.value;
      inputElement.value = '$' + inputElement.value + ' ' + this.currency;
    }
  }

  formatNumberWithCommasAndDecimals(value: string): string {
    const numberValue = parseFloat(value).toFixed(2);
    return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  changeRenderInput(type) {
    if (this.valuesInputs[type].originalValue === '') {
      this.valuesInputs[type].originalValue = '00.00';
      this.prices[type] = parseFloat(this.valuesInputs[type].originalValue) || 0;
      this.checkValidated();
    }
    this.valuesInputs[type].inputValue = '$' + this.valuesInputs[type].originalValue + ' ' + this.currency;
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
