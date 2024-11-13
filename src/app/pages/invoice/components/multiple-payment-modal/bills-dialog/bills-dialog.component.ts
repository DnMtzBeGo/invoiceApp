import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { ApiRestService } from '@begomx/ui-components';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IBillSerie, IBillVersion, IInvoicePayment, IPageChangeEvent, ISearch, ISelecAtionParams } from '../interfaces';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

@Component({
  selector: 'app-bills-dialog',
  templateUrl: './bills-dialog.component.html',
  styleUrls: ['./bills-dialog.component.scss'],
})
export class BillsDialogComponent {
  public billsTable: any = {};
  public searchForm: FormGroup;
  public versions: IBillVersion[];
  public series: IBillSerie[];
  public selectedRows: IInvoicePayment[] = [];

  // TODO type data
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly matDialogRef: MatDialogRef<BillsDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly dateAdapter: DateAdapter<Date>,
    private readonly api: ApiRestService,
    private readonly notificationsService: NotificationsService,
  ) {
    //Calendar format setting
    this.dateAdapter.setLocale('en-GB');

    // Initialization
    this._loadSeries();
    this._initBillsTable()._initSearchForm().loadTableData();
    this.versions = [{ version: '3.3' }, { version: '4.0' }];
    this.series = [];
  }

  private _initBillsTable(): BillsDialogComponent {
    this.billsTable = {
      loading: false,
      tableColumns: [
        {
          id: 'version',
          label: 'Versión',
        },
        {
          id: 'uuid',
          label: 'UUID',
        },
        {
          id: 'serie_label',
          label: 'Serie',
        },
        {
          id: 'folio',
          label: 'Folio',
        },
        {
          id: 'moneda',
          label: 'Moneda',
        },
        {
          id: 'tipo_de_cambio',
          label: 'Tipo Cambio',
        },
        {
          id: 'num_pago',
          label: 'No. P',
        },
        {
          id: 'total',
          label: 'Total',
        },
        {
          id: 'monto_pendiente',
          label: 'Monto pendiente',
        },
      ],
      pageUi: { size: 10, index: 1, total: 0, pages: 0 },
      tableActions: [],
      tableValues: [],
      page: {
        pageIndex: 1,
        index: 1,
      },
      selectRow: {
        showColumnSelection: true,
        selectionLimit: 100,
        keyPrimaryRow: 'uuid',
      },
      changePage: ({ index, size }: IPageChangeEvent) => {
        this.billsTable.page.pageIndex = index;
        this.billsTable.pageUi.index = index;
        if (this.billsTable.pageUi.size !== size) {
          this.billsTable.page.pageIndex = 1;
          this.billsTable.pageUi.index = 1;
        }
        this.billsTable.page.pageSize = size;
        this.loadTableData();
      },
      selectAction: ({ type, data }: ISelecAtionParams) => {},
    };

    return this;
  }

  public rowSelected($event: IInvoicePayment[]): void {
    for (const invoice of $event) {
      if (!this.selectedRows.find((el: IInvoicePayment) => el.uuid === invoice.uuid)) this.selectedRows.push(invoice);
    }

    this.billsTable.tableValues.forEach((tableValue: IInvoicePayment) => {
      if (!$event.find((el) => el.uuid === tableValue.uuid)) {
        const index = this.selectedRows.findIndex((el) => el.uuid === tableValue.uuid);

        if (index > -1) this.selectedRows.splice(index, 1);
      }
    });
  }

  private _setTableValues(data: IInvoicePayment[], pages: number, size: number): void {
    this.billsTable.tableValues = data.map((invoice: IInvoicePayment) => {
      return {
        ...invoice,
        selection_check: false, // this.selectedRows.find((selected: IInvoicePayment) => invoice.uuid === selected.uuid),
      };
    });

    // Excludes already selected invoices
    if (this.data?.selected?.length)
      this.billsTable.tableValues = this.billsTable.tableValues.filter(
        (invoice) => !this.data.selected.includes(invoice._id),
      );

    this.billsTable.pageUi = {
      ...this.billsTable.pageUi,
      index: this.billsTable.page.pageIndex,
      total: pages * size,
      pages,
    };
  }

  private _initSearchForm(): BillsDialogComponent {
    this.searchForm = this.formBuilder.group({
      date_start: [''],
      date_end: [''],
      serie: [''],
      folio: [''],
      uuid: [''],
      version: [''],
    });

    return this;
  }

  private _prepareQuery(): string {
    const queryParams = new URLSearchParams();

    const search: ISearch = Object.fromEntries(
      Object.entries(this.searchForm.value).filter(([_, v]) => v != '' && null !== v && undefined !== v),
    );
    const keys = Object.keys(search);

    for (const key of keys) {
      queryParams.append(key, search[key as keyof ISearch]);
    }

    queryParams.append('page', this.billsTable.pageUi.index);
    queryParams.append('limit', this.billsTable.pageUi.size);

    return '?' + queryParams.toString();
  }

  public async loadTableData(): Promise<void> {
    (await this.api.apiRestGet(`invoice/payments${this._prepareQuery()}`)).subscribe({
      next: ({ result: { invoices, pages, size } }) => {
        this._setTableValues(invoices, pages, size);
      },
      error: () => {
        this.notificationsService.showErrorToastr('There was an error, try again later');
      },
    });
  }

  private _prepareSeriesQuery(): string {
    const queryParams = new URLSearchParams();

    queryParams.append(
      'match',
      JSON.stringify({
        tipo_comprobante: 'P',
      }),
    );

    queryParams.append('strict_match', 'true');

    return '?' + queryParams.toString();
  }

  private async _loadSeries(): Promise<BillsDialogComponent> {
    (await this.api.apiRestGet(`invoice/series${this._prepareSeriesQuery()}`)).subscribe({
      next: ({ result: { series } }) => {
        this.series = series.map(({ _id, serie }) => ({
          _id,
          serie,
        }));
      },
      error: () => {
        this.notificationsService.showErrorToastr('There was an error, try again later');
      },
    });

    return this;
  }

  public accept(): void {
    this.matDialogRef.close(this.selectedRows);
  }

  public close(): void {
    this.matDialogRef.close([]);
  }

  public search(): void {
    this.loadTableData();
  }

  public clearForm(): void {
    this.searchForm.reset();
    this.loadTableData();
  }
}
