import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentsUploadModalComponent } from './components/payments-upload-modal/payments-upload-modal.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  columns: any[] = [
    { id: 'order_number', label: 'Orden' },
    { id: 'due_date', label: 'Vencimiento' },
    { id: 'folio', label: 'Factura' },
    { id: 'razon_social', label: 'Razon Social' },
    { id: 'status', label: 'Status' },
    { id: 'subtotal', label: 'Subtotal' },
    { id: 'total', label: 'Total' },
    { id: 'bank', label: 'Banco' },
    { id: 'account', label: 'Numero de cuenta' }
    // { id: '_id', label: 'Numero de ID' },
    // { id: 'user_id', label: 'Numero de USER' }
  ];

  actions = [
    {
      label: 'Editar pago',
      id: 'edit_invoice',
      icon: 'edit-fintech'
    },
    {
      label: 'Ver PDF',
      id: 'view_pdf',
      icon: 'eye'
    },
    {
      label: 'Ver XML',
      id: 'view_xml',
      icon: 'eye'
    },
    {
      label: 'Eliminar pago',
      id: 'delete_payment',
      icon: 'trash1'
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

  

  constructor(
    private webService: AuthService,
    private notificationsService: NotificationsService,
    private matDialog: MatDialog,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {}

  async ngOnInit() {
    this.page.size = this.searchQueries.limit;
    this.page.index = this.searchQueries.page - 1;
    await this.getPayments();

    this.openUploaderModal()
  }

  async getPayments() {
    this.loadingData = true;
    const { limit, page, sort, match } = this.searchQueries;
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(sort && { sort }),
      ...(match && { match })
    }).toString();

    (await this.webService.apiRestGet(`carriers_payments/?${queryParams}`, { apiVersion: 'v1.1', loader: 'false' })).subscribe({
      next: ({ result: { result, total } }) => {
        this.page.total = total;
        this.payments = result.map((data) => {
          return {
            ...data,
            due_date: this.datePipe.transform(data.due_date) || '-',
            total: this.currency(data.total),
            subtotal: this.currency(data.subtotal)
          };
        });
        this.loadingData = false;
      },
      error: () => (this.loadingData = false)
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
    this.searchQueries.sort = JSON.stringify({ [type]: asc ? 1 : -1 });
    this.page.index = 0;
    this.searchQueries.page = 1;
    this.getPayments();
  }

  changingPage({ index, size }: any) {
    this.searchQueries.page = index + 1;
    console.log('changing page: ', this.searchQueries.limit, size);
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

    dialogRef.afterClosed().subscribe((result?) => {
      /* if (result?.success === true) {
        this.facturasEmitter.next(["refresh:defaultEmisor"]);
      } */
    });
  }

  currency(price: number) {
    if (price) return this.currencyPipe.transform(price, 'MXN', 'symbol-narrow', '1.0-0') + ' MXN';
    return '-';
  }

  openFile({ files }: any, type: 'pdf' | 'xml') {
    if (files[type]) window.open(files[type]);
    else this.notificationsService.showErrorToastr('Archivo inexistente');
  }
}
