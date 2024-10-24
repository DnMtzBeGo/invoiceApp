import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { merge, timer, from, Subject, combineLatest, of } from 'rxjs';
import {
  mapTo,
  mergeAll,
  pluck,
  debounceTime,
  share,
  repeatWhen,
  switchMap,
  map,
  withLatestFrom,
  tap,
  distinctUntilChanged,
  skip,
  filter,
  takeUntil,
  startWith,
} from 'rxjs/operators';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routes } from '../../consts';
import { Paginator } from '../../models';
import { FacturaFiltersComponent, ActionConfirmationComponent } from '../../modals';
import { FacturaEmitterComponent } from '../../components/factura-emitter/factura-emitter.component';
import { reactiveComponent } from 'src/app/shared/utils/decorators';
import { ofType, oof } from 'src/app/shared/utils/operators.rx';
import { arrayToObject, object_compare, clone } from 'src/app/shared/utils/object';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DatePipe } from '@angular/common';
import { facturaPermissions } from '../factura-edit-page/factura.core';
import { ApiRestService } from 'src/app/services/api-rest.service';
import { BegoDialogService } from '@begomx/ui-components';
import { IInvoicePayment, IPaymentComplementDialogParams } from '../../components/multiple-payment-modal/interfaces';
import { MatDialogConfig } from '@angular/material/dialog';
import { MultiplePaymentModalComponent } from '../../components/multiple-payment-modal/multiple-payment-modal.component';

const filterParams = new Set([
  'fec_inicial',
  'fec_final',
  'emisor',
  'receptor',
  'tipo_de_comprobante',
  'uuid',
  'status',
]);

const status2observe = new Set([2, 4]);
const observeTime = 5000;
const shouldObserve = (facturas) => facturas.some((factura) => status2observe.has(factura.status));

@Component({
  selector: 'app-facturas-page',
  templateUrl: './facturas-page.component.html',
  styleUrls: ['./facturas-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FacturasPageComponent implements OnInit {
  public routes: typeof routes = routes;
  $rx = reactiveComponent(this);

  private selectedInvoices: IInvoicePayment[] = [];

  private filtersDialogRef: any;

  public vm!: {
    tiposComprobante?: unknown;
    facturaStatus?: unknown;
    params?: {
      uuid?: string;
      fec_inicial?: Date;
      fec_final?: Date;
      emisor?: string;
      receptor?: string;
      tipo_de_comprobante?: string;
      status?: string;
    };
    facturas?: unknown[];
    facturasLoading?: boolean;
    refreshTimer?: number;
    defaultEmisor?: unknown[];
    template?: string;
    searchAction?: {
      type: 'template';
      search: string;
    };
    searchLoading?: boolean;
    receptorSearch?: {
      template?: unknown[];
    };
  };

  public facturasEmitter = new Subject<
    ['refresh' | 'filters:set' | 'template:search' | 'template:set' | 'refresh:defaultEmisor', unknown?]
  >();

  public paginator: Paginator;

  public p = facturaPermissions;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private matDialog: MatDialog,
    private apiRestService: AuthService,
    private apiService: ApiRestService,
    private translateService: TranslateService,
    private cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private readonly begoDialog: BegoDialogService,
  ) {
    this.paginator = {
      pageIndex: +this.route.snapshot.queryParams.page || 1,
      pageSize: +this.route.snapshot.queryParams.limit || 10,
      pageTotal: 1,
      pageSearch: '',
    };
  }

  public ngOnInit(): void {
    const loadDataAction$ = merge(oof(''), this.facturasEmitter.pipe(ofType('refresh')));

    const tiposComprobante$ = this.fetchTipoComprobante().pipe(share());

    const facturaStatus$ = this.fetchFacturaStatus().pipe(share());

    const params$ = merge(
      oof(this.route.snapshot.queryParams),
      this.route.queryParams.pipe(skip(1), debounceTime(500)),
    ).pipe(
      distinctUntilChanged(object_compare),
      map((params: any) => ({
        ...params,
        limit: +params.limit || this.paginator.pageSize,
        page: +params.page || this.paginator.pageIndex,
        fec_inicial: params.fec_inicial ? this.decodeFecha(params.fec_inicial) : null,
        fec_final: params.fec_final ? this.decodeFecha(params.fec_final) : null,
      })),
      tap((params) => {
        this.paginator.pageSize = Number(params.limit);
        this.paginator.pageIndex = Number(params.page);
      }),
      share(),
    );

    const facturasRequest$ = combineLatest([loadDataAction$, params$]).pipe(pluck('1'), share());

    const facturas$ = combineLatest(
      tiposComprobante$.pipe(map(arrayToObject('clave', 'descripcion'))),
      facturaStatus$.pipe(map(arrayToObject('clave', 'nombre'))),
      facturasRequest$.pipe(
        switchMap(this.fetchFacturas),
        tap((result) => {
          this.paginator.pageTotal = result.pages;
          this.paginator.total = result.size;
        }),
        pluck('invoices'),
      ),
    ).pipe(
      map(([tiposComprobante, facturaStatus, facturas]: any) =>
        facturas.map((factura: any) => ({
          ...factura,
          plataforma: {
            type:
              factura.source == 'orden'
                ? 'invoice-driver'
                : factura.source == 'factura'
                ? 'invoice-cfdi'
                : 'invoice-order',
            label:
              factura.source == 'orden'
                ? this.translate('invoice.tooltips.invoice_source.drivers')
                : factura.source == 'factura'
                ? this.translate('invoice.tooltips.invoice_source.factura')
                : this.translate('invoice.tooltips.invoice_source.ordenes'),
          },
          uuid: factura.uuid,
          fecha_emision: this.getDate(factura.fecha_emision),
          serie: factura?.serie_label || factura?.serie,
          emisor: factura.emisor,
          emisor_: `${factura.emisor?.nombre || ''}\n${factura.emisor?.rfc || ''}`,
          receptor: factura.receptor,
          receptor_: `${factura.receptor?.nombre || ''}\n${factura.receptor?.rfc || ''}`,
          tipo: tiposComprobante[factura.tipo_de_comprobante] || factura.tipo_de_comprobante,
          tipo_de_comprobante: factura.tipo_de_comprobante,
          status_: facturaStatus[factura.status] || factura.status,
          status: factura.status,
          // status: '',
          subtotal: this.getCurrency(factura?.subtotal),
          total: this.getCurrency(factura?.total),
          folio: factura?.folio,
          files: factura?.files,
        })),
      ),
      tap((d) => {
        this.cd.markForCheck();
      }),
      share(),
    );

    const facturasLoading$ = merge(facturasRequest$.pipe(mapTo(true)), facturas$.pipe(mapTo(false)));

    const refreshTimer$ = facturas$.pipe(
      switchMap((facturas) =>
        shouldObserve(facturas)
          ? timer(observeTime).pipe(
              mapTo(1),
              tap(() => this.facturasEmitter.next(['refresh'])),
            )
          : of(0),
      ),
    );

    // EMISORES
    const defaultEmisor$ = this.fetchEmisores().pipe(
      repeatWhen(() => this.facturasEmitter.pipe(ofType('refresh:defaultEmisor'))),
    );

    //TEMPLATES
    const emptySearch = (search: any) => search.search === '';
    const validSearch = (search: any) => !emptySearch(search);

    const template$ = oof('');

    const searchAction$ = merge(
      this.facturasEmitter.pipe(
        ofType('template:search'),
        map((search: string) => ({ type: 'template' as const, search })),
      ),
    ).pipe(share());

    const cancelSearchAction$ = merge(
      searchAction$.pipe(filter(emptySearch)),
      this.facturasEmitter.pipe(ofType('template:set')),
    );

    const validSearch$ = searchAction$.pipe(
      filter(validSearch),
      switchMap((search) => timer(500).pipe(takeUntil(cancelSearchAction$), mapTo(search))),
    );

    const searchRequest$ = validSearch$.pipe(
      switchMap((search) => this.searchTemplate(search).pipe(takeUntil(cancelSearchAction$))),
      share(),
    );

    const searchLoading$ = merge(
      oof(false),
      validSearch$.pipe(mapTo(true)),
      searchRequest$.pipe(mapTo(false)),
      cancelSearchAction$.pipe(mapTo(false)),
    );

    const receptorSearch$ = merge(
      searchRequest$.pipe(
        withLatestFrom(searchAction$),
        map(([requestData, search]: any) => ({
          [search.type]: requestData,
        })),
      ),
      cancelSearchAction$.pipe(mapTo({})),
    );

    this.vm = this.$rx.connect({
      tiposComprobante: tiposComprobante$,
      facturaStatus: facturaStatus$,
      params: params$,
      facturas: facturas$,
      facturasLoading: facturasLoading$,
      refreshTimer: refreshTimer$,
      defaultEmisor: defaultEmisor$,
      template: template$,
      searchAction: searchAction$,
      searchLoading: searchLoading$,
      receptorSearch: receptorSearch$,
    });
  }

  // API calls
  private fetchFacturas = (params: any) => {
    params = { ...params };

    const fechas =
      (params.fec_inicial &&
        params.fec_final && {
          fec_inicial: params.fec_inicial ? String(params.fec_inicial) : '',
          fec_final: params.fec_final ? (params.fec_final.setHours(23, 59, 59), String(params.fec_final)) : '',
        }) ||
      {};

    delete params.fec_inicial;
    delete params.fec_final;

    return from(
      this.apiRestService.apiRestGet('invoice', {
        loader: 'false',
        ...params,
        ...fechas,
      }),
    ).pipe(mergeAll(), pluck('result'));
  };

  private fetchTipoComprobante() {
    return from(
      this.apiRestService.apiRestGet('invoice/catalogs/tipos-de-comprobante', {
        loader: 'false',
      }),
    ).pipe(mergeAll(), pluck('result'));
  }

  private fetchFacturaStatus = () => {
    return from(
      this.apiRestService.apiRestGet('invoice/catalogs/statuses', {
        loader: 'false',
      }),
    ).pipe(mergeAll(), pluck('result'));
  };

  private fetchEmisores() {
    return from(
      this.apiRestService.apiRestGet('invoice/emitters', {
        loader: 'false',
      }),
    ).pipe(
      mergeAll(),
      map((responseData) => {
        const emisores = responseData?.result?.documents;

        // return void 0;
        // return [];

        if (emisores == void 0) return void 0;

        return emisores.length === 0 ? [] : [emisores.pop()];
      }),
      startWith(null),
    );
  }

  public searchTemplate(search: { type: 'template'; search: string }) {
    const endpoints = {
      template: 'invoice/get_drafts',
    };
    const keys = {
      template: 'search',
    };

    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          pagination: {
            size: 10,
            page: 1,
          },
          [keys[search.type]]: search.search,
        }),
        endpoints[search.type],
        { loader: 'false' },
      ),
    ).pipe(mergeAll(), pluck('result'));
  }

  // MODALS
  public openFilters() {
    if (this.filtersDialogRef) return;

    this.filtersDialogRef = this.matDialog.open(FacturaFiltersComponent, {
      data: {
        tiposComprobante: this.vm.tiposComprobante,
        facturaStatus: this.vm.facturaStatus,
        params: clone(this.vm.params),
      },
      restoreFocus: false,
      autoFocus: false,
      // panelClass: [""],
      // hasBackdrop: true,
      backdropClass: ['brand-dialog-1', 'dialog-filters'],
      position: {
        top: '12.5rem',
      },
    });

    // TODO: false/positive when close event
    this.filtersDialogRef.afterClosed().subscribe((params) => {
      this.filtersDialogRef = void 0;

      if (!params) return;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          ...params,
          page: 1,
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  public noEmisorAlert() {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: this.translateService.instant('invoice.invoices.noemisor-title'),
        modalMessage: this.translateService.instant('invoice.invoices.noemisor-message'),
        confirm: this.translateService.instant('invoice.invoices.noemisor-confirm'),
      },
      restoreFocus: false,
      backdropClass: ['brand-dialog-1'],
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((res?) => {
      res && this.createEditEmisor();
    });
  }

  public createEditEmisor(emisor?) {
    const dialogRef = this.matDialog.open(FacturaEmitterComponent, {
      data: emisor,
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ['brand-dialog-1'],
    });

    dialogRef.afterClosed().subscribe((result?) => {
      if (result?.success === true) {
        this.facturasEmitter.next(['refresh:defaultEmisor']);
      }
    });
  }

  //UTILS
  public log = (...args: any[]) => {
    console.log(...args);
  };

  public makeTemplate = (template: object) => {
    return encodeURIComponent(JSON.stringify(template));
  };

  public decodeFecha = (strDate: string) => {
    return new Date(strDate);
  };

  public filtersCount = (params = {}) =>
    Object.keys(params).filter((filterName) => filterParams.has(filterName) && params[filterName]).length || null;

  public translate = (text: string) => this.translateService.instant(text);

  public getDate = (date: string) => {
    const parsedDate: Date = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Invalid Date';

    return this.datePipe.transform(parsedDate, 'MMM d, yy');
  };
  public getCurrency = (price: number) =>
    price
      ? '$' +
        price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '';

  private _validatePaymentDialogOpening(invoices: IInvoicePayment[]): boolean {
    let emitter_rfc = '';
    let receiver_rfc = '';
    const errors: string[] = [];

    if (invoices?.length) {
      for (const invoice of invoices) {
        console.log(invoice);

        const payments = +invoice.payments?.length ? invoice.payments.reduce((acc, { amount }) => acc + amount, 0) : 0;

        if (payments && payments === +invoice.total)
          errors.push(`La factura ${invoice.uuid ?? ''} ya ha sido pagada por completo`);

        if (invoice.monto_a_pagar <= 0)
          if (emitter_rfc) {
            if (emitter_rfc !== invoice.emisor.rfc) errors.push(`Las facturas deben pertenecer a un mismo emisor`);
          } else emitter_rfc = invoice.emisor.rfc;

        if (receiver_rfc) {
          if (receiver_rfc !== invoice.receptor.rfc) errors.push(`Las facturas deben pertenecer a un mismo receptor`);
        } else receiver_rfc = invoice.receptor.rfc;

        if (!invoice.uuid) errors.push('No puede agregar como parte del pago un comprobante que no se ha timbrado');

        if (invoice.tipo_de_comprobante !== 'I')
          errors.push(`El comprobante ${invoice.uuid ?? ''} no es un comprobante de ingreso (I)`);

        if (invoice.metodo_de_pago !== 'PPD')
          errors.push(
            `El comprobante ${invoice.uuid ?? ''} no tiene el metodo de pago "Pago en parcialidades o diferido (PPD)"`,
          );
      }
    } else {
      errors.push('Debe seleccionar al menos una factura');
    }

    if (errors.length) {
      this._openTryToStampConfirmation(errors.join('\n'));
      return false;
    }

    return true;
  }

  public openMultiplePaymenDialog(): void {
    if (this._validatePaymentDialogOpening(this.selectedInvoices)) {
      const data: IPaymentComplementDialogParams = { invoices: this.selectedInvoices };
      const config = new MatDialogConfig();
      config.data = data;
      config.disableClose = true;
      config.autoFocus = true;

      const dialogRef = this.matDialog.open(MultiplePaymentModalComponent, config);

      dialogRef.afterClosed().subscribe((data) => {
        if (data?.created)
          this.begoDialog.open({
            type: 'informative',
            title: 'Pago creado exitosamente!',
            content: 'Se ha agregado a la fila de timbrado para su certificación',
            btnCopies: {
              confirm: 'Ok',
            },
          });
      });
    }
  }

  private _openTryToStampConfirmation(message: string): void {
    this.begoDialog.open({
      type: 'informative',
      title: 'Pago Múltiple',
      content: message,
      btnCopies: {
        confirm: 'Ok',
      },
    });
  }

  public invoiceSelectionChanged(data: IInvoicePayment[]): void {
    this.selectedInvoices = data;
  }

  public resetSelectedInvoices(): void {
    for (const invoice of this.vm.facturas) {
      invoice['selection_check'] = false;
    }
    this.vm.facturas = [];
    this.selectedInvoices = [];
  }
}
