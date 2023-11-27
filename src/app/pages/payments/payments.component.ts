import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentsUploadModalComponent } from './components/payments-upload-modal/payments-upload-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { EditedModalComponent } from './components/edited-modal/edited-modal.component';
import { FilesViewModalComponent } from './components/files-view-modal/files-view-modal.component';
import { ListViewModalComponent } from './components/list-view-modal/list-view-modal.component';
import { BankDetailsModalComponent } from './components/bank-details-modal/bank-details-modal.component';
import { MessagesModalComponent } from './components/messages-modal/messages-modal.component';
import * as moment from 'moment';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  statusOptions = [
    { label: 'Cancel', value: 'cancel', id: -3 },
    { label: 'Rejected', value: 'rejected', id: -2 },
    { label: 'Invalid', value: 'invalid-data', id: -1 },
    { label: 'Uploaded', value: 'uploaded', id: 0 },
    { label: 'Validated', value: 'validated', id: 1 },
    { label: 'Pending', value: 'pending-payment', id: 2 },
    { label: 'Paid', value: 'paid', id: 3 }
  ];

  columns: any[] = [
    { id: 'order_number', label: '', filter: 'input', sort: true },
    { id: 'reference_number', label: '', filter: 'input' },
    { id: 'due_date', label: '', input: 'style', sort: true },
    { id: 'razon_social', label: '', filter: 'input', sort: true },
    { id: 'status', label: '', filter: 'selector', options: this.statusOptions, sort: true },
    { id: 'vouchers_icon', label: 'vouchers_icon', input: 'icon' },
    { id: 'subtotal', label: '', sort: true },
    { id: 'total', label: '', sort: true },
    //{ id: 'bank', label: '', filter: 'input', sort: true },
    //{ id: 'account', label: '', sort: true },
    //{ id: 'swift', label: '', sort: true },
    { id: 'date_created', label: '', sort: true },
    { id: 'payment_method', label: '' },
    { id: 'last_message', label: '' }
  ];

  lang = {
    selected: 'en',
    paginator: {
      total: '',
      totalOf: '',
      nextPage: '',
      prevPage: '',
      itemsPerPage: ''
    },
    filter: {
      input: '',
      selector: ''
    }
  };

  actions = [
    {
      label: this.translate('view_pdf', 'actions'),
      id: 'view_pdf',
      icon: 'eye'
    },
    {
      label: this.translate('view_xml', 'actions'),
      id: 'view_xml',
      icon: 'eye'
    },
    {
      label: this.translate('view_vouchers', 'actions'),
      id: 'view_vouchers',
      icon: 'eye'
    },
    {
      label: this.translate('view_upfronts', 'actions'),
      id: 'view_upfronts',
      icon: 'eye'
    },
    {
      label: this.translate('view_message', 'actions'),
      id: 'view_message',
      icon: 'eye'
    },
    {
      label: this.translate('view_bank', 'actions'),
      id: 'view_bank',
      icon: 'eye'
    }
  ];

  page = { size: 0, index: 0, total: 0 };

  searchQueries = {
    limit: 10,
    page: 1,
    sort: JSON.stringify({ due_date: -1 }),
    match: ''
  };

  selectRow: any = {
    showColumnSelection: false,
    selectionLimit: 0,
    keyPrimaryRow: 'concept'
  };

  payments = [];

  loadingData: boolean = true;

  constructor(
    private webService: AuthService,
    private notificationsService: NotificationsService,
    private matDialog: MatDialog,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private translateService: TranslateService
  ) {
    this.lang.selected = localStorage.getItem('lang') || 'en';
    this.setLang();
  }

  async ngOnInit() {
    this.translateService.onLangChange.subscribe(async ({ lang }) => {
      this.lang.selected = lang;
      this.setLang();
      await this.getPayments(true);
    });

    this.page.size = this.searchQueries.limit;
    this.page.index = this.searchQueries.page;
    await this.getPayments();
  }

  async getPayments(translated?: boolean) {
    this.loadingData = true;

    if (translated) this.payments = [];

    const { limit, page, sort, match } = this.searchQueries;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(sort && { sort }),
      ...(match && { match })
    }).toString();

    (await this.webService.apiRestGet(`carriers_payments/?${queryParams}`, { apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, total } }) => {
        this.page.total = total;
        this.payments = result.map((payment) => {
          const due_date =  this.countdownFormatter(payment?.due_date, payment?.status);
            
          const validDoc = this.validateVouchers(payment);
          if (validDoc) {
            payment.vouchers_icon = {
              icon: 'document',
              label: ''
            };
          } else {
            payment.vouchers_icon = {
              icon: '',
              label: '-'
            };
          }

          const actions = {
            enabled: false,
            options: {
              view_pdf: !!payment.files?.pdf,
              view_xml: !!payment.files?.xml,
              view_vouchers: payment?.vouchers,
              view_upfronts: payment?.upfront_vouchers,
              view_bank: payment?.bank,
              view_message: true
            }
          };

          actions.enabled = Object.values(actions.options).includes(true);

          return {
            ...payment,
            actions,
            due_date,
            payment_method: payment?.payment_method || '-',
            reference_number: payment?.reference_number || '-',
            carrier_credit_days: this.creditDays(payment.carrier_credit_days),
            date_created: this.datePipe.transform(payment.date_created, 'MM/dd/yyyy HH:mm', '', this.lang.selected),
            total: this.currency(payment.total, payment?.moneda),
            subtotal: this.currency(payment.subtotal, payment?.moneda),
            status: this.translate(payment.status, 'status')
          };
        });
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingData = false;
      }
    });
  }

  selectingAction({ type, data }: any) {
    switch (type) {
      case 'view_pdf':
        this.openFile(data, 'pdf');
        break;
      case 'view_xml':
        this.openFile(data, 'xml');
        break;
      case 'view_vouchers':
        this.openFilesViewModal(data, 'vouchers');
        break;
      case 'view_upfronts':
        this.openFilesViewModal(data, 'upfront_vouchers');
        break;
      case 'view_bank':
        this.openBankDetailssModal(data);
        break;
      case 'view_message':
        this.openMessageModal(data);
        break;
    }
  }

  sortingTable({ type, asc }: any) {
    this.searchQueries.sort = JSON.stringify({ [type]: asc ? -1 : 1 });
    this.page.index = 1;
    this.searchQueries.page = 1;
    this.getPayments();
  }

  changingPage({ index, size }: any) {
    this.searchQueries.page = index;
    if (this.searchQueries.limit !== size) {
      this.page.index = 1;
      this.searchQueries.page = 1;
    }
    this.searchQueries.limit = size;
    this.getPayments();
  }

  openUploaderModal() {
    const dialogRef = this.matDialog.open(PaymentsUploadModalComponent, {
      data: {},
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1']
    });

    dialogRef.afterClosed().subscribe((edited: string) => {
      if (edited === 'success') {
        this.searchQueries.sort = JSON.stringify({ date_created: -1 });
        this.openUploadedModal();
        this.getPayments();
      }
    });
  }

  openMessageModal(data) {
    const dialogRef = this.matDialog.open(MessagesModalComponent, {
      data,
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1'],
    });

    dialogRef.afterClosed().subscribe((uploaded: boolean) => {
      this.getPayments();
    });
  }

  openUploadedModal() {
    const dialogRef = this.matDialog.open(EditedModalComponent, {
      data: {
        title: this.translate('title', 'edited-modal'),
        subtitle: this.translate('subtitle', 'edited-modal')
      },
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1', 'no-padding', 'full-visible']
    });
  }

  openFilesViewModal(data: any, modal_key: string) {
    const dialogRef = this.matDialog.open(FilesViewModalComponent, {
      data: { ...data, modal_key },
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1', 'no-padding', 'full-visible']
    });
  }

  openViewVouchersModal(data) {
    const dialogRef = this.matDialog.open(ListViewModalComponent, {
      data,
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1', 'no-padding', 'full-visible']
    });
  }

  openBankDetailssModal(data) {
    const dialogRef = this.matDialog.open(BankDetailsModalComponent, {
      data,
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1', 'no-padding', 'full-visible']
    });
  }

  openFile({ files }: any, type: 'pdf' | 'xml') {
    if (files[type]) window.open(files[type]);
    else this.notificationsService.showErrorToastr('Archivo inexistente');
  }

  currency(price: number, type: string = 'MXN') {
    if (price) return this.currencyPipe.transform(price, type, 'symbol-narrow', '1.2-2') + ` ${type}`;
    return '-';
  }

  translate(word: string, type: string) {
    return this.translateService.instant(`payments.${type}.${word}`);
  }

  setLang() {
    this.lang.paginator = {
      total: this.translate('total', 'paginator'),
      totalOf: this.translate('of', 'paginator'),
      nextPage: this.translate('nextPage', 'paginator'),
      prevPage: this.translate('prevPage', 'paginator'),
      itemsPerPage: this.translate('itemsPerPage', 'paginator')
    };

    this.lang.filter = {
      input: this.translate('input', 'filter'),
      selector: this.translate('selector', 'filter')
    };

    this.statusOptions.forEach((status) => (status.label = this.translate(status.value, 'status')));
    this.columns.forEach((column) => (column.label = this.translate(column.id, 'table')));
    this.actions.forEach((action) => (action.label = this.translate(action.id, 'actions')));
  }

  filterData({ active, search, type }) {
    if (active) {
      if (type === 'status') this.searchQueries.match = JSON.stringify({ status: this.searchStatus(search) });
      else this.searchQueries.match = JSON.stringify({ [type]: search });
    } else this.searchQueries.match = '';
    this.page.index = 1;
    this.searchQueries.page = 1;
    this.getPayments();
  }

  creditDays(days: number) {
    if (!days || days === -1) return 'TBD';
    if (days === 3) return 'APP';
    return `${days} ${this.lang.selected === 'es' ? ' días' : ' days'}`;
  }

  searchStatus(search) {
    return this.statusOptions.find((status) => status.value === search).id;
  }

  handleReload(event: any) {
    if (event === 'reloadTable') {
      this.getPayments();
    }
  }

  clickReload(){
    this.getPayments();
  }

  validateVouchers(event) {
    let validDoc = false;
    if (event?.vouchers) {
      let contador = 0;

      for (let i = 0; i < event?.vouchers.length; i++) {
        if (event?.vouchers[i] !== null && event?.vouchers[i] !== undefined) {
          contador++;
        }
      }
      if (contador > 0) {
        validDoc = true;
      } else {
        validDoc = false;
      }
    }
    if (event?.upfront_vouchers) {
      let contador = 0;

      for (let i = 0; i < event?.upfront_vouchers.length; i++) {
        if (event?.upfront_vouchers[i] !== null && event?.upfront_vouchers[i] !== undefined) {
          contador++;
        }
      }
      if (contador > 0) {
        validDoc = true;
      } else {
        validDoc = false;
      }
    }
    return validDoc;
  }

  selectColumn(event) {
    if (event?.column?.id === 'vouchers_icon') {
      let allDocVocuchers: any = {
        vouchers: [],
        upfront_vouchers: []
      };
      if (event?.element?.vouchers) {
        allDocVocuchers.vouchers = event?.element?.vouchers;
      }
      if (event?.element?.upfront_vouchers) {
        allDocVocuchers.upfront_vouchers = event?.element?.upfront_vouchers;
      }
      this.openViewVouchersModal(allDocVocuchers);
    }
    if (event?.column?.id === 'last_message') {
      this.openMessageModal(event?.element);
    }
  }

  countdownFormatter(value: number, status: string): object {
  const translation = this.translateService.instant(`payments.expiration`);
  const currentDate = moment();
  const targetDate = moment.unix(value / 1000);

  let due_date: any;

  if (currentDate.isAfter(targetDate)) {
    due_date = {
      value: status === 'paid'
        ? this.translateService.instant(`payments.expiration.paid`)
        : `${translation.expired} (${targetDate.format('DD/MM/YY')})`,
      style: {
        color: status === 'paid' ? '#38EB67' : '#EB4515', 
        'font-weight': 700
      }
    };
  } else {
    let remainingDays = targetDate.diff(currentDate, 'days');
    
    const value = status === 'paid'
      ? this.translateService.instant(`payments.expiration.paid`)
      : remainingDays < 1
        ? translation.lastDay
        : `${remainingDays} ${translation.days}`;

    due_date = {
      value: value,
      style: {
        color: status === 'paid' ? '#38EB67' : remainingDays <= 2 ? '#FFFB00' : '#FFFFFF',
        'font-weight': 700
      }
    };
  }

  return due_date;
}

}
