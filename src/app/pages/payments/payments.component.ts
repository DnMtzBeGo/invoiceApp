import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentsUploadModalComponent } from './components/payments-upload-modal/payments-upload-modal.component';
import { TranslateService } from '@ngx-translate/core';

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
    { id: 'order_number', label: '', input: 'label', activeFilter: 'label' },
    { id: 'due_date', label: '', input: 'label', pipe: 'countdown' },
    { id: 'carrier_credit_days', label: '', input: 'label' },
    { id: 'razon_social', label: '', input: 'label', activeFilter: 'label' },
    { id: 'status', label: '', input: 'label', activeFilter: 'selector', options: this.statusOptions },
    { id: 'subtotal', label: '', input: 'label' },
    { id: 'total', label: '', input: 'label' },
    { id: 'bank', label: '', input: 'label', activeFilter: 'label' },
    { id: 'account', label: '', input: 'label' },
    { id: 'pdf', label: 'PDF', input: 'label' },
    { id: 'xml', label: 'XML', input: 'label' },
    { id: 'date_created', label: '', input: 'label' }
  ];

  paginatorLang = {
    total: '',
    totalOf: '',
    nextPage: '',
    prevPage: '',
    itemsPerPage: ''
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
    }
  ];

  page = { size: 0, index: 0, total: 0 };

  searchQueries = {
    limit: 10,
    page: 1,
    sort: JSON.stringify({ due_date: -1 }),
    match: ''
  };

  payments = [];

  loadingData: boolean = false;
  lang: string = null;

  constructor(
    private webService: AuthService,
    private notificationsService: NotificationsService,
    private matDialog: MatDialog,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private translateService: TranslateService
  ) {
    this.lang = localStorage.getItem('lang') || 'en';
    this.setLang();
  }

  async ngOnInit() {
    this.translateService.onLangChange.subscribe(async ({ lang }) => {
      this.lang = lang;
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

    (await this.webService.apiRestGet(`carriers_payments/?${queryParams}`, { loader: 'false', apiVersion: 'v1.1' })).subscribe({
      next: ({ result: { result, total } }) => {
        this.page.total = total;
        this.payments = result.map((payment) => {
          return {
            ...payment,
            carrier_credit_days: this.creditDays(payment.carrier_credit_days),
            date_created: this.datePipe.transform(payment.date_created, 'MM/dd/yy', '', this.lang),
            // date_created: this.datePipe.transform(payment.date_created, 'MMMM d, yy', '', this.lang),
            total: this.currency(payment.total, payment?.moneda),
            subtotal: this.currency(payment.subtotal, payment?.moneda),
            status: this.translate(payment.status, 'status'),
            pdf: payment.files?.pdf ? '✓' : '✕',
            xml: payment.files?.xml ? '✓' : '✕'
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

    dialogRef.afterClosed().subscribe((uploaded: boolean) => {
      if (uploaded) {
        this.searchQueries.sort = JSON.stringify({ date_created: -1 });
        this.getPayments();
      }
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
    this.paginatorLang = {
      total: this.translate('total', 'paginator'),
      totalOf: this.translate('of', 'paginator'),
      nextPage: this.translate('nextPage', 'paginator'),
      prevPage: this.translate('prevPage', 'paginator'),
      itemsPerPage: this.translate('itemsPerPage', 'paginator')
    };
    this.statusOptions.forEach((status) => (status.label = this.translate(status.value, 'status')));
    this.columns.forEach((column) => (column.label = this.translate(column.id, 'table')));
    this.actions.forEach((action) => (action.label = this.translate(action.id, 'actions')));
  }

  filterData({ active, search, type }) {
    console.log('filtering: ', active, search, type);
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
    return `${days} ${this.lang === 'es' ? ' días' : ' days'}`;
  }

  searchStatus(search) {
    return this.statusOptions.find((status) => status.value === search).id;
  }
}
