import { Component, Input, OnInit, OnChanges, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { Router } from '@angular/router';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { Paginator } from '../../models';
import { routes } from '../../consts';
import { environment } from 'src/environments/environment';
import { facturaPermissions, facturaStatus } from '../../containers/factura-edit-page/factura.core';

import {
  ActionSendEmailFacturaComponent,
  ActionCancelarFacturaComponent,
  ActionConfirmationComponent,
} from '../../modals';
import { IIndexInvoice, IInvoicesTable, IInvoicesTableItem, ITablePageUI, ITableSelectingAction } from './model';
import { InvoicePDF } from '../../containers/facturas-page/InvoicePDF';
import { ApiRestService } from 'src/app/services/api-rest.service';

@Component({
  selector: 'app-factura-table',
  templateUrl: './factura-table.component.html',
  styleUrls: ['./factura-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FacturaTableComponent extends InvoicePDF implements OnInit, OnChanges {
  public routes: typeof routes = routes;
  public URL_BASE = environment.URL_BASE;
  public token = localStorage.getItem('token') || '';

  @Input() public loading: boolean = true;
  //Table data
  @Input() public invoicesData: IIndexInvoice[];
  //Paginator
  @Input() public page: Paginator;
  @Output() public pageChange: EventEmitter<Paginator> = new EventEmitter();

  public sizeOptions = [5, 10, 20, 50, 100];
  //Filter
  public isShowFilterInput: boolean = false;

  //Refresh
  @Output() public refresh: EventEmitter<void> = new EventEmitter();

  public lang = {
    selected: 'en',
    paginator: {
      total: '',
      totalOf: '',
      nextPage: '',
      prevPage: '',
      itemsPerPage: '',
    },
    filter: {
      input: '',
      selector: '',
    },
  };

  public pageUI: ITablePageUI;
  public invoicesTable: IInvoicesTable;

  constructor(
    private readonly matDialog: MatDialog,
    private readonly router: Router,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly apiRestService: ApiRestService,
  ) {
    super(apiRestService, notificationsService);
    this._initTable().setLang();
  }

  public ngOnChanges(): void {
    this.handleUpdateTable();
  }

  public async ngOnInit(): Promise<void> {
    this.pageUI = {
      size: 0,
      index: 0,
      total: 0,
    };

    this.translateService.onLangChange.subscribe(async ({ lang }) => {
      this.lang.selected = lang;
      this.setLang();
      // await this.getPayments(true);
    });
    this.lang.selected = localStorage.getItem('lang') || 'en';
  }

  private _initTable = (): FacturaTableComponent => {
    this.invoicesTable = {
      columns: [
        { id: 'plataforma', label: 'Plataforma', input: 'icon' },
        { id: 'fecha_emision', label: 'Fec. Emision' },
        { id: 'emisor', label: 'Emisor' },
        { id: 'receptor', label: 'Receptor' },
        { id: 'serie', label: 'Serie' },
        { id: 'folio', label: 'Folio' },
        { id: 'tipo', label: 'Tipo' },
        { id: 'status_', label: 'Estatus' },
        { id: 'subtotal', label: 'Subtotal' },
        { id: 'total', label: 'Total' },
      ],
      values: [],
      actions: [
        {
          id: 'edit_order_factura',
          label: '',
          translate: 'edit-invoice',
          icon: 'edit',
        },
        {
          id: 'edit_factura',
          label: '',
          translate: 'edit-invoice',
          icon: 'edit',
        },
        {
          id: 'download_preview',
          label: '',
          translate: 'preview',
          icon: 'download',
        },
        {
          id: 'download_pdf',
          label: '',
          translate: 'download-pdf',
          icon: 'download',
        },
        {
          id: 'download_pdf_driver',
          label: '',
          translate: 'download-pdf-driver',
          icon: 'download',
        },
        {
          id: 'download_pdf_cancelado',
          label: '',
          translate: 'download-pdf',
          icon: 'download',
        },
        {
          id: 'download_xml',
          label: '',
          translate: 'download-xml',
          icon: 'download',
        },
        {
          id: 'download_xml_acuse',
          label: '',
          translate: 'download-acuse',
          icon: 'download',
        },
        {
          id: 'duplicate',
          label: '',
          translate: 'duplicate',
          icon: 'eye',
        },
        {
          id: 'send_by_email',
          label: '',
          translate: 'send-by-email',
          icon: 'email',
        },
        {
          id: 'cancel_invoice',
          label: '',
          translate: 'cancel-invoice',
          icon: 'close',
        },
        {
          id: 'delete_invoice',
          label: '',
          translate: 'delete-invoice',
          icon: 'trash1',
        },
      ],
      selectRow: {
        showColumnSelection: true,
        selectionLimit: 0,
        keyPrimaryRow: 'id',
      },
      selectingAction: ({ type, data }: ITableSelectingAction): void => {
        console.log({ type, data });

        switch (type) {
          case 'edit_order_factura':
            this.router.navigateByUrl(`${routes.EDIT_ORDER_FACTURA};id=${data.order}`);
            break;

          case 'edit_factura':
            this.router.navigateByUrl(`${routes.EDIT_FACTURA};id=${data._id}`);
            break;

          case 'download_preview':
            this.downloadPreviewById(data._id);
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
            console.log('action type no controlled', type);
            break;
        }
      },
      rowSelected: ($invoice: IInvoicesTableItem): void => {},
    };

    return this;
  };

  //Table data
  public handleUpdateTable(): FacturaTableComponent {
    this.invoicesTable.values =
      this.invoicesData?.map((item: Partial<IIndexInvoice>): IInvoicesTableItem => {
        const {
          _id,
          tipo,
          emisor,
          fecha_emision,
          receptor,
          serie_label,
          status,
          status_,
          tipo_de_comprobante,
          subtotal,
          total,
          plataforma,
          order,
          files,
          folio,
        } = item;

        plataforma.icon = plataforma.type;
        plataforma.label = '';
        const options = {
          edit_order_factura: this.p(item).edit && !!order,
          edit_factura: this.p(item).edit && !!!order,
          download_preview: this.p(item).vistaprevia,
          download_pdf: this.p(item).pdf,
          download_pdf_driver: this.p(item).pdf_driver && files?.pdf_driver,
          download_pdf_cancelado: this.p(item).pdf_cancelado,
          download_xml: this.p(item).xml,
          download_xml_acuse: this.p(item).xml_acuse,
          duplicate: this.p(item).duplicar,
          send_by_email: this.p(item).enviar_correo,
          cancel_invoice: this.p(item).cancelar,
          delete_invoice: this.p(item).eliminar,
        };

        return {
          _id,
          plataforma,
          fecha_emision,
          emisor,
          receptor,
          serie: serie_label,
          folio,
          status,
          status_,
          tipo,
          tipo_de_comprobante,
          subtotal,
          total,
          order,
          files,
          actions: {
            enabled: Object.values(options).includes(true),
            options,
          },
          selection_check: false,
        };
      }) || [];

    this.pageUI = {
      index: this.page.pageIndex,
      total: this.page.total,
      size: this.page.pageSize,
    };

    this.loading = false;

    return this;
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
  public sendEmailFactura(_id: string): void {
    this.matDialog.open(ActionSendEmailFacturaComponent, {
      data: {
        _id,
        to: [],
        reply_to: '',
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1'],
    });
  }

  public cancelarFactura(_id: string): void {
    this.matDialog.open(ActionCancelarFacturaComponent, {
      data: {
        _id,
        afterSuccessDelay: () => {
          this.refresh.emit();
        },
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1'],
    });
  }

  public deleteFactura(_id: string): void {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: this.translateService.instant('invoice.invoice-table.delete-title'),
        modalMessage: this.translateService.instant('invoice.invoice-table.delete-message'),
        modalPayload: {
          body: {
            _id,
          },
          endpoint: 'invoice/delete',
          successMessage: this.translateService.instant('invoice.invoice-table.delete-success'),
          errorMessage: this.translateService.instant('invoice.invoice-table.delete-error'),
          // TODO: remove action?
          action: 'emitBegoUser',
        },
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1'],
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((res?) => {
      if (res) {
        this.refresh.emit();
      }
    });
  }

  // UTILS
  public p = facturaPermissions;

  public facturaStatus = facturaStatus;

  public ngOnDestroy(): void {
    this.revokePdfUrl();
  }

  public showError = (error: any): string => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error ?? e.message).join('\n') : error;
  };

  public newPageData = { index: 0, total: 0, size: 0 };

  public changingPage({ index, size }: any): void {
    this.page.pageIndex = index;
    this.pageUI.index = index;
    if (this.pageUI.size !== size) {
      this.page.pageIndex = 1;
      this.pageUI.index = 1;
    }
    this.page.pageSize = size;
    this.pageChange.emit(this.page);
  }

  public translate(type: string, word: string): string {
    return this.translateService.instant(`${type}.${word}`);
  }

  public setLang(): FacturaTableComponent {
    this.lang.paginator = {
      total: this.translate('paginator', 'total'),
      totalOf: this.translate('paginator', 'of'),
      nextPage: this.translate('paginator', 'nextPage'),
      prevPage: this.translate('paginator', 'prevPage'),
      itemsPerPage: this.translate('paginator', 'itemsPerPage'),
    };

    this.lang.filter = {
      input: this.translate('filter', 'input'),
      selector: this.translate('filter', 'selector'),
    };

    //this.statusOptions.forEach((status) => (status.label = this.translate(status.value, 'status')));
    this.invoicesTable.columns.forEach((column) => (column.label = this.translate('invoice.table', column.id)));
    this.invoicesTable.actions.forEach((action) => {
      action.label = this.translate('invoice.invoice-table', action.translate);
    });

    return this;
  }

  public downloadPdf(pdfLink: string): void {
    console.log(pdfLink);

    if (pdfLink) window.open(pdfLink, '_blank');
  }
}
