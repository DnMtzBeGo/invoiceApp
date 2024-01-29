import { Component, Input, OnInit, ViewChild, OnChanges, AfterViewInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MatSort } from '@angular/material/sort';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { Paginator, TableFactura } from '../../models';
import { routes } from '../../consts';
import { environment } from 'src/environments/environment';
import { facturaPermissions, previewFactura, facturaStatus } from '../../containers/factura-edit-page/factura.core';
import { clone } from '../../../../shared/utils/object';
import { ActionSendEmailFacturaComponent, ActionCancelarFacturaComponent, ActionConfirmationComponent } from '../../modals';

@Component({
  selector: 'app-factura-table',
  templateUrl: './factura-table.component.html',
  styleUrls: ['./factura-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FacturaTableComponent implements OnInit, OnChanges, AfterViewInit {
  public routes: typeof routes = routes;
  public URL_BASE = environment.URL_BASE;
  public token = localStorage.getItem('token') || '';

  //Table data
  @Input() orderTableData: TableFactura[];
  public displayedColumns: string[] = [
    'plataforma',
    'fecha_emision',
    'emisor',
    'receptor',
    'serie',
    'tipo',
    'status',
    'subtotal',
    'total',
    'actions'
  ];
  public dataSource: MatTableDataSource<TableFactura>;

  // Loading
  // @Input() loading: boolean = false;

  //Filter
  public isShowFilterInput: boolean = false;

  //Paginator
  @Input() page: Paginator;
  @Output() pageChange: EventEmitter<Paginator> = new EventEmitter();
  public sizeOptions = [5, 10, 20, 50, 100];

  //Sorting
  @ViewChild(MatSort) sort: MatSort;

  //Refresh
  @Output() refresh: EventEmitter<void> = new EventEmitter();

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

  constructor(
    private matDialog: MatDialog,
    private router: Router,
    private notificationsService: NotificationsService,
    private translateService: TranslateService
  ) {
    this.lang.selected = localStorage.getItem('lang') || 'en';
    this.setLang();
  }

  public ngOnChanges(): void {
    this.handleUpdateTable();
  }

  public async ngOnInit() {
    this.translateService.onLangChange.subscribe(async ({ lang }) => {
      this.lang.selected = lang;
      this.setLang();
      // await this.getPayments(true);
    });
    this.dataSource = new MatTableDataSource<TableFactura>(this.orderTableData);
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  //Table data
  public handleUpdateTable() {
    if (this.dataSource) {
      this.dataSource.data = [];
      this.dataSource = new MatTableDataSource<TableFactura>(this.orderTableData);
      this.dataSource.sort = this.sort;
    }

    this.newPageData = {
      index: this.page.pageIndex,
      total: this.page.total,
      size: this.page.pageSize
    };
  }

  public pageChangeEmiter(page: number = 1) {
    this.page.pageIndex = page;
    this.pageChange.emit(this.page);
  }

  //Paginator
  public pagination(page: number) {
    this.pageChangeEmiter(page);
  }

  // Filter
  public applyFilter(event: any): void {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.page.pageSearch = (event.target as HTMLInputElement).value;
      this.pageChangeEmiter();
    }
  }

  public showFilterInput(close = false): void {
    if (close) {
      this.page.pageSearch = '';
      this.pageChangeEmiter();
    }
    this.isShowFilterInput = !this.isShowFilterInput;
  }

  // Actions

  // MODALS
  sendEmailFactura(_id: string) {
    this.matDialog.open(ActionSendEmailFacturaComponent, {
      data: {
        _id,
        to: [],
        reply_to: ''
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1']
    });
  }

  cancelarFactura(_id: string) {
    this.matDialog.open(ActionCancelarFacturaComponent, {
      data: {
        _id,
        afterSuccessDelay: () => {
          this.refresh.emit();
        }
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1']
    });
  }

  deleteFactura(_id: string) {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: this.translateService.instant('invoice.invoice-table.delete-title'),
        modalMessage: this.translateService.instant('invoice.invoice-table.delete-message'),
        modalPayload: {
          body: {
            _id
          },
          endpoint: 'invoice/delete',
          successMessage: this.translateService.instant('invoice.invoice-table.delete-success'),
          errorMessage: this.translateService.instant('invoice.invoice-table.delete-error'),
          // TODO: remove action?
          action: 'emitBegoUser'
        }
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1']
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((res?) => {
      if (res) {
        this.refresh.emit();
      }
    });
  }

  // UTILS
  p = facturaPermissions;

  facturaStatus = facturaStatus;

  downloadPreview = (factura?) => {
    if (factura == void 0) return;

    window
      .fetch(this.URL_BASE + 'invoice/preview_consignment_note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Acceontrol-Allow-Headers': 'Content-Type, Accept',
          'Access-Css-Control-Allow-Methods': 'POST,GET,OPTIONS',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify(previewFactura(clone(factura)))
      })
      .then((responseData) => responseData.arrayBuffer())
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: 'application/pdf'
        });

        const linkSource = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.target = '_blank';
        // downloadLink.download = 'Vista previa.pdf'
        downloadLink.click();
        setTimeout(() => URL.revokeObjectURL(linkSource), 5000);
      })
      .catch(() => {
        this.notificationsService.showErrorToastr(this.translateService.instant('invoice.invoice-table.preview-error'));
      });
  };

  showError = (error: any) => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error ?? e.message).join('\n') : error;
  };

  public newPageData = { index: 0, total: 0, size: 0 };

  // plate number type carrier fleet availability

  public columns: any[] = [
    { id: 'plataforma', label: '', input: 'icon' },
    { id: 'fecha_emision', label: '' },
    { id: 'emisor', label: '' },
    { id: 'receptor', label: '' },
    { id: 'serie', label: '' },
    { id: 'tipo', label: '' },
    { id: 'status', label: '' },
    { id: 'subtotal', label: '' },
    { id: 'total', label: '' }
  ];

  @Input() public loading: boolean = true;

  public changingPage({ index, size }: any) {
    console.log('page changes: ', index, size);
    this.page.pageIndex = index;
    this.newPageData.index = index;
    if (this.newPageData.size !== size) {
      this.page.pageIndex = 1;
      this.newPageData.index = 1;
    }
    this.page.pageSize = size;
    this.pageChange.emit(this.page);
  }

  public actions = [
    {
      id: 'edit_order_factura',
      label: '',
      translate: 'edit-invoice',
      icon: 'edit'
    },
    {
      id: 'edit_factura',
      label: '',
      translate: 'edit-invoice',
      icon: 'edit'
    },
    {
      id: 'download_preview',
      label: '',
      translate: 'preview',
      icon: 'download'
    },
    {
      id: 'download_pdf',
      label: '',
      translate: 'download-pdf',
      icon: 'download'
    },
    {
      id: 'download_pdf_driver',
      label: '',
      translate: 'download-pdf-driver',
      icon: 'download'
    },
    {
      id: 'download_pdf_cancelado',
      label: '',
      translate: 'download-pdf',
      icon: 'download'
    },
    {
      id: 'download_xml',
      label: '',
      translate: 'download-xml',
      icon: 'download'
    },
    {
      id: 'download_xml_acuse',
      label: '',
      translate: 'download-acuse',
      icon: 'download'
    },
    {
      id: 'duplicate',
      label: '',
      translate: 'duplicate',
      icon: 'eye'
    },
    {
      id: 'send_by_email',
      label: '',
      translate: 'send-by-email',
      icon: 'mail'
    },
    {
      id: 'cancel_invoice',
      label: '',
      translate: 'cancel-invoice',
      icon: 'close'
    },
    {
      id: 'delete_invoice',
      label: '',
      translate: 'delete-invoice',
      icon: 'trash1'
    }
  ];

  public async selectingAction({ type, data }: any) {
    switch (type) {
      case 'edit_order_factura':
        this.router.navigateByUrl(`${routes.EDIT_ORDER_FACTURA};id=${data.order}`);
        break;

      case 'edit_factura':
        this.router.navigateByUrl(`${routes.EDIT_FACTURA};id=${data._id}`);
        break;

      case 'download_preview':
        this.downloadPreview(data);
        break;

      case 'download_pdf':
        this.downloadPdf(data.files?.pdf);
        break;

      case 'download_pdf_driver':
        this.downloadPdf(data.files?.pdf_driver);
        break;

      case 'download_pdf_cancelado':
        this.downloadPdf(data.files?.pdf_cancelado);
        break;

      case 'download_xml':
        this.downloadPdf(data.files?.xml);
        break;

      case 'download_xml_acuse':
        this.downloadPdf(data.files?.xml_acuse);
        break;

      case 'duplicate':
        this.router.navigateByUrl(`${routes.NEW_FACTURA};template=${data._id}`);
        break;

      case 'send_by_email':
        this.sendEmailFactura(data._id);
        break;

      case 'cancel_invoice':
        this.cancelarFactura(data._id);
        break;

      case 'delete_invoice':
        this.deleteFactura(data._id);
        break;

      default:
        break;
    }
  }

  translate(type: string, word: string) {
    return this.translateService.instant(`${type}.${word}`);
  }

  setLang() {
    this.lang.paginator = {
      total: this.translate('paginator', 'total'),
      totalOf: this.translate('paginator', 'of'),
      nextPage: this.translate('paginator', 'nextPage'),
      prevPage: this.translate('paginator', 'prevPage'),
      itemsPerPage: this.translate('paginator', 'itemsPerPage')
    };

    this.lang.filter = {
      input: this.translate('filter', 'input'),
      selector: this.translate('filter', 'selector')
    };

    // this.statusOptions.forEach((status) => (status.label = this.translate(status.value, 'status')));
    this.columns.forEach((column) => (column.label = this.translate('invoice.table', column.id)));
    this.actions.forEach((action) => (action.label = this.translate('invoice.invoice-table', action.translate)));
  }

  downloadPdf(pdfLink: string) {
    if (pdfLink) window.open(pdfLink, '_blank');
  }
}
