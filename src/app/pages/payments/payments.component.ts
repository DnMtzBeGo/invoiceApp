import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentsUploadModalComponent } from './components/payments-upload-modal/payments-upload-modal.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  columns: any[] = [
    { id: 'order_number', label: this.translate('order_number', 'table') },
    { id: 'due_date', label: this.translate('due_date', 'table') },
    { id: 'folio', label: this.translate('folio', 'table') },
    { id: 'razon_social', label: this.translate('razon_social', 'table') },
    { id: 'status', label: this.translate('status', 'table') },
    { id: 'subtotal', label: this.translate('subtotal', 'table') },
    { id: 'total', label: this.translate('total', 'table') },
    { id: 'bank', label: this.translate('bank', 'table') },
    { id: 'account', label: this.translate('account', 'table') },
    { id: 'date_created', label: this.translate('date_created', 'table') }
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
    sort: '',
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
    this.page.index = this.searchQueries.page - 1;

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
            due_date: this.datePipe.transform(payment.due_date, 'MMMM d, yy', '', this.lang),
            date_created: this.datePipe.transform(payment.date_created, 'MMMM d, yy', '', this.lang),
            total: this.currency(payment.total),
            subtotal: this.currency(payment.subtotal),
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
    }
  }

  sortingTable({ type, asc }: any) {
    this.searchQueries.sort = JSON.stringify({ [type]: asc ? -1 : 1 });
    this.page.index = 0;
    this.searchQueries.page = 1;
    this.getPayments();
  }

  changingPage({ index, size }: any) {
    this.searchQueries.page = index + 1;
    if (this.searchQueries.limit !== size) {
      this.page.index = 0;
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

  currency(price: number) {
    if (price) return this.currencyPipe.transform(price, 'MXN', 'symbol-narrow', '1.2-2') + ' MXN';
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
    this.columns.forEach((column) => (column.label = this.translate(column.id, 'table')));
    this.actions.forEach((action) => (action.label = this.translate(action.id, 'actions')));
  }
}
