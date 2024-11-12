import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { of, timer, Subject, merge, from, Observable, forkJoin, Subscription } from 'rxjs';
import {
  tap,
  filter,
  switchMap,
  share,
  map,
  withLatestFrom,
  takeUntil,
  mergeAll,
  distinctUntilChanged,
} from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from 'src/app/shared/services/auth.service';
import { reactiveComponent } from 'src/app/shared/utils/decorators';
import { ofType, simpleFilters, oof } from 'src/app/shared/utils/operators.rx';
import { makeRequestStream } from 'src/app/shared/utils/http.rx';
import { clone } from 'src/app/shared/utils/object';
import { routes } from '../../consts';
import { BegoSliderDotsOpts } from 'src/app/shared/components/bego-slider-dots/bego-slider-dots.component';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

interface VM {
  // "receptor" | "precio" | "orden";
  tab?: string;
  form?: {
    _id?: string;
    status?: number;
    invoice?: {
      // receptor
      receiver?: {
        // direccion
        address?: {
          place_id?: string;
          address?: string;
        };
        company?: string;
        rfc?: string;
        cfdi?: string;
        tax_regime?: string;
        series_id?: string;
      };
    };
    pricing?: {
      subtotal: number;
      deferred_payment: boolean;
    };
    destinations: {
      destination_id: string;
      tax_information?: {
        rfc?: string;
        company_name?: string;
      };
    }[];
    cargo?: {
      cargo_goods: string;
      commodity_quantity: number;
      unit_type: string;
      packaging: string;
      hazardous_material: string;
      required_units?: number;
      trailer?: {
        load_cap: string;
      };
      weight?: number[];
    };
    // computed
    metodo_de_pago?: string;
  };
  readonly?: boolean;
  catalogos?: {
    regimen_fiscal?: unknown[];
    monedas?: unknown[];
    metodos_de_pago?: unknown[];
    formas_de_pago?: unknown[];
    tipos_de_impuesto?: unknown[];
    unidades_de_medida?: unknown[];
    tipos_de_comprobante?: unknown[];
    tipos_de_relacion?: unknown[];
    usos_cfdi?: unknown[];
    // carta porte
    tipos_de_embalaje?: unknown[];
  };
  series?: unknown[];
  helpTooltips?: any;
  searchAction?: {
    type: 'rfc' | 'nombre' | 'cve_sat' | 'cve_material';
    search: string;
    rfc?: string;
  };
  receptorSearch?: {
    rfc?: unknown[];
    nombre?: unknown[];
    cve_sat?: unknown[];
    cve_material?: unknown[];
  };
  tipoPersona?: 'fisica' | 'moral';
  searchLoading?: boolean;
  formMode?: any;
  formLoading?: unknown;
  formError?: any;
  formSuccess?: any;
}

@Component({
  selector: 'app-factura-order-edit-page',
  templateUrl: './factura-order-edit-page.component.html',
  styleUrls: ['./factura-edit-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturaOrderEditPageComponent implements OnInit, OnDestroy {
  public unitsData: any = {
    first: {
      label: '53 ft',
      value: '53',
    },
    second: {
      label: '48 ft',
      value: '48',
    },
  };

  public routes: typeof routes = routes;

  public $rx = reactiveComponent(this);

  public vm: VM;

  public formEmitter = new Subject<
    [
      (
        | 'tab'
        | 'refresh'
        | 'rfc:search'
        | 'series:search'
        | 'nombre:search'
        | 'autocomplete:cancel'
        | 'catalogos:search'
        | 'rfc:set'
        | 'conceptos:search_cve'
        | 'cargo:search_material'
        | 'submit'
      ),
      unknown,
    ]
  >();

  public lang: string = 'en';
  public orderWithCP: boolean = true;
  // public orderWithCP: boolean = false;
  public stepIndex: number = 0;
  public fileTypes = ['.xlsx'];
  public multipleFilesLang;
  public files: any = null;
  public langSub: Subscription;
  public multipleCargo: boolean = false;
  public Array = Array;

  public id: string;
  public mode: 'create' | 'update';
  public model: 'order' = 'order';
  public tabs = ['receptor', 'precio', 'orden'];
  public sliderDotsOpts: BegoSliderDotsOpts = {
    totalElements: this.tabs.length,
    value: 0,
    valueChange: (slideIndex: number): void => {
      this.sliderDotsOpts.value = slideIndex;
      this.formEmitter.next(['tab', this.tabs[slideIndex]]);
    },
  };

  constructor(
    private router: Router,
    private apiRestService: AuthService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private cd: ChangeDetectorRef,
    private httpClient: HttpClient,
    private notificationsService: NotificationsService,
  ) {
    this.multipleFilesLang = {
      name: this.translateService.instant('orders.upload-multiple-orders.name'),
      labelBrowse: this.translateService.instant('orders.upload-multiple-orders.labelBrowse'),
      labelOr: this.translateService.instant('orders.upload-multiple-orders.labelOr'),
      btnBrowse: this.translateService.instant('orders.upload-multiple-orders.btnBrowse'),
      labelMax: this.translateService.instant('orders.upload-multiple-orders.labelMax'),
      uploading: this.translateService.instant('orders.upload-multiple-orders.uploading'),
    };
  }

  public ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || 'en';

    this.langSub = this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.lang = langChangeEvent.lang;
    });

    //TAB
    const tab$ = merge(
      of(this.route.snapshot.queryParams.tab ?? 'receptor'),
      (this.formEmitter.pipe(ofType('tab')) as Observable<string>).pipe(
        distinctUntilChanged(),
        map((tab) => {
          const tabIndex = isNaN(parseInt(tab)) ? this.tabs.indexOf(tab) : Number(tab);
          tab = isNaN(parseInt(tab)) ? tab : this.tabs[tabIndex];

          this.sliderDotsOpts.value = tabIndex;
          this.vm.readonly &&
            window.scrollTo({
              top: 112 + window.document.getElementById(tab)?.offsetTop - 16,
              behavior: 'smooth',
            });
          this.stepStatus(this.stepIndex);
          return tab;
        }),
      ),
    );

    //DATA FETCHING
    const loadDataAction$ = merge(oof(''), this.formEmitter.pipe(ofType('refresh')));

    const form$ = loadDataAction$.pipe(
      tap(() => {
        //ROUTE INFO
        this.id = this.route.snapshot.paramMap.get('id');
        this.mode = this.id == null ? 'create' : 'update';
      }),
      switchMap(() => {
        return this.mode === 'create' ? this.createForm() : this.fetchForm(this.id);
      }),
      share(),
    );

    const readonly$ = merge(
      loadDataAction$.pipe(
        map(() => ({
          status: Number(this.route.snapshot.paramMap.get('status')),
        })),
      ),
      form$,
    ).pipe(
      map(orderPermissions),
      map((d) => d?.readonly),
      distinctUntilChanged(),
    );

    const catalogos$ = this.fetchCatalogosSAT().pipe(
      simpleFilters(this.formEmitter.pipe(ofType('catalogos:search'), share())),
      share(),
    );
    const series$ = this.fetchSeries().pipe(
      simpleFilters(this.formEmitter.pipe(ofType('series:search'), share())),
      share(),
    );

    const helpTooltips$ = this.fetchHelpTooltips();

    //RECEPTOR
    const emptySearch = (search) => search.search === '';
    const validSearch = (search) => !emptySearch(search);
    const getTipoPersona = (rfc) => (rfc?.length === 12 ? 'moral' : rfc?.length === 13 ? 'fisica' : null);
    const normalizeRFC = (rfc: string) => rfc.toUpperCase().trim();

    const searchAction$ = merge(
      this.formEmitter.pipe(
        ofType('rfc:search'),
        map((search: string) => ({ type: 'rfc' as const, search })),
        tap(() => {
          // this.vm.form.invoice.receiver.company = "";
          // this.vm.form.invoice.receiver.cfdi = "";
          // this.vm.form.invoice.receiver.tax_regime = "";
          // this.vm.form.invoice.receiver.address = {};
        }),
      ),
      this.formEmitter.pipe(
        ofType('nombre:search'),
        map((search: string) => ({ type: 'nombre' as const, search })),
      ),
      this.formEmitter.pipe(
        ofType('conceptos:search_cve'),
        map((search: string) => ({ type: 'cve_sat' as const, search })),
      ),
      this.formEmitter.pipe(
        ofType('cargo:search_material'),
        map((search: string) => ({ type: 'cve_material' as const, search })),
      ),
    ).pipe(share());

    const cancelSearchAction$ = merge(
      searchAction$.pipe(filter(emptySearch)),
      this.formEmitter.pipe(ofType('autocomplete:cancel')),
    );

    const validSearch$ = searchAction$.pipe(
      filter(validSearch),
      switchMap((search) =>
        timer(500).pipe(
          takeUntil(cancelSearchAction$),
          map(() => search),
        ),
      ),
    );

    const searchRequest$ = validSearch$.pipe(
      switchMap((search) => this.searchReceptor(search).pipe(takeUntil(cancelSearchAction$))),
      share(),
    );

    const searchLoading$ = merge(
      oof(false),
      validSearch$.pipe(map(() => true)),
      searchRequest$.pipe(map(() => false)),
      cancelSearchAction$.pipe(map(() => false)),
    );

    const receptorSearch$ = merge(
      searchRequest$.pipe(
        withLatestFrom(searchAction$),
        map(([requestData, search]: any) => ({
          [search.type]: requestData,
        })),
        tap(() => {
          this.cd.markForCheck();
        }),
      ),
      cancelSearchAction$.pipe(map(() => {})),
    );

    const receptorRFC$ = merge(
      form$.pipe(map((d) => d?.invoice?.receiver?.rfc)),
      this.formEmitter.pipe(ofType('rfc:search')),
      this.formEmitter.pipe(ofType('rfc:set'), map(normalizeRFC)),
    ).pipe(share());

    const tipoPersona$ = receptorRFC$.pipe(distinctUntilChanged(), map(getTipoPersona));

    //FORM SUBMIT
    const formMode$ = this.formEmitter.pipe(
      ofType('submit'),
      map((d) => d[1]),
    );

    const {
      loading$: formLoading$,
      error$: formError$,
      success$: formSuccess$,
    } = makeRequestStream({
      fetch$: this.formEmitter.pipe(ofType('submit')),
      fetch: this.submitFactura,
      afterSuccess: () => {},
      afterSuccessDelay: () => {
        (this.route.snapshot.paramMap.get('redirectTo') &&
          this.router.navigateByUrl(this.route.snapshot.paramMap.get('redirectTo'))) ||
          this.router.navigate([routes.FACTURAS]);
      },
      afterError: () => {
        this.cd.markForCheck();
        // window.scrollTo({
        //   top: 9999999,
        //   behavior: "smooth",
        // });
      },
    });

    this.vm = this.$rx.connect({
      tab: tab$,
      form: form$,
      readonly: readonly$,
      catalogos: catalogos$,
      series: series$,
      helpTooltips: helpTooltips$,
      searchAction: searchAction$,
      receptorSearch: receptorSearch$,
      tipoPersona: tipoPersona$,
      searchLoading: searchLoading$,
      formMode: formMode$,
      formLoading: formLoading$,
      formError: formError$,
      formSuccess: formSuccess$,
    }) as VM;
  }

  public ngOnDestroy(): void {
    this.langSub.unsubscribe();
  }

  public createForm() {
    return of({
      invoice: {
        receiver: {
          address: {
            place_id: '',
            address: '',
          },
          company: '',
          rfc: '',
          cfdi: '',
          tax_regime: '',
        },
      },
      destinations: [{ contact_info: { rfc: '' } }, { contact_info: { rfc: '' } }],
      cargo: {
        cargo_goods: '',
        commodity_quantity: 0,
        unit_type: '',
        packaging: '',
        hazardous_material: '',
      },
      pricing: {
        subtotal: 0,
        deferred_payment: false,
      },
    });
  }

  // API calls
  public fetchForm(_id) {
    return from(this.apiRestService.apiRest('', `carriers/orders/${_id}`, { apiVersion: 'v1.1' })).pipe(
      mergeAll(),
      map((responseData) => this.fromOrder(responseData?.result)),
    );
  }

  public fetchCatalogosSAT() {
    return forkJoin(
      // facturación
      from(this.apiRestService.apiRestGet('invoice/catalogs/invoice')).pipe(
        mergeAll(),
        map((d) => d?.result),
      ),
      // carta porte
      from(this.apiRestService.apiRestGet('invoice/catalogs/consignment-note')).pipe(
        mergeAll(),
        map((d) => d?.result),
      ),
    ).pipe(map((catalogs) => Object.assign.apply(null, catalogs)));
  }

  public fetchSeries() {
    const carrierId = localStorage.getItem('profileId');

    return forkJoin(
      // facturación
      from(this.apiRestService.apiRestGet(`invoice/series/by-carrier/${carrierId}`)).pipe(
        mergeAll(),
        map((d) => d?.result),
      ),
    ); /* .pipe(map((catalogs) => Object.assign.apply(null, catalogs))); */
  }

  public fetchHelpTooltips() {
    return oof(this.translateService.instant('invoice.tooltips'));
  }

  public searchReceptor(search) {
    const endpoints = {
      rfc: 'invoice/receivers',
      nombre: 'invoice/receivers/by-name',
      cve_sat: 'invoice/catalogs/consignment-note/productos-y-servicios',
      cve_material: 'invoice/catalogs/consignment-note/material-peligroso',
    };
    const keys = {
      rfc: 'rfc',
      nombre: 'name',
      cve_sat: 'term',
      cve_material: 'term',
    };

    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          [keys[search.type]]: search.search,
          limit: 15,
          ...(search.rfc != void 0 ? { rfc: search.rfc } : {}),
        }),
        endpoints[search.type],
        { loader: 'false' },
      ),
    ).pipe(
      mergeAll(),
      map((d) => d?.result),
    );
  }

  public submitFactura = ([mode, saveMode, factura]) => {
    factura = clone(factura);

    const data = { orderInfo: toOrder(factura) };

    return from(
      this.apiRestService.apiRest(JSON.stringify(data), 'orders/update_consignment_note_info', {
        loader: 'false',
      }),
    ).pipe(
      mergeAll(),
      // NOTE: wrap success response
      map((responseData) => ({
        result: responseData,
      })),
    );
  };

  // MODALS

  // FORMS

  // UTILS
  public p = orderPermissions;

  public log = (...args) => {
    console.log(...args);
  };

  public showError = (error: any) => {
    error = error?.message || error?.error;
    // lang
    error = error?.[this.translateService.currentLang];

    return Array.isArray(error) ? error.map((e) => e.error ?? e.message).join(',\n') : error;
  };

  public async stepStatus(type: number) {
    if (type > 0) {
      this.multipleCargo = true;
    } else {
      this.handleFileChange(null);
      this.multipleCargo = false;
    }
    // this.updateValidators(type > 0);
  }

  public downloadTemplate() {
    const URL: string =
      'https://begoclients.s3.amazonaws.com/production/layouts/orders/layout-multiple-merchandise-order.xlsx';
    this.httpClient.get(URL, { responseType: 'blob' }).subscribe((blob) => {
      const link = document.createElement('a');
      const objectUrl = window.URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = URL.split('/').pop() || 'archivo';
      link.click();
      window.URL.revokeObjectURL(objectUrl);
    });
  }

  public async handleFileChange(file?: File, type?: 'xlsx') {
    if (file) {
      this.files = {
        name: file.name,
        date: new Date(file.lastModified),
        size: file.size,
      };
      // this.setFileValidators();
      this.uploadMultipleCargoFile(file);
    } else {
      this.files = null;
      this.deleteMultipleCargoFile();
    }

    // this.step3Form.get('multipleCargoFile')!.setValue(file);
  }

  private async uploadMultipleCargoFile(file: File) {
    if (!this.id) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('load_cap', this.vm.form.cargo?.trailer?.load_cap);
    formData.append('required_units', String(this.vm.form?.cargo?.commodity_quantity));

    const req = await this.apiRestService.uploadFilesSerivce(
      formData,
      `orders/cargo/import-ftl/${this.id}`,
      { apiVersion: 'v1.1' },
      { timeout: '300000' },
    );

    await req
      .toPromise()
      .then(() => {
        // this.clearUploadedMultipleFile = !this.clearUploadedMultipleFile;
      })
      .catch(({ error: { error } }) => {
        // this.clearFailedMultipleFile = !this.clearFailedMultipleFile;
        const { message, errors } = error;
        let errMsg = `${message[this.lang] || ''}.`;
        console.error(errMsg);

        if (errors?.en) {
          errMsg += `
        ${errors[this.lang] || ''}`;
        }

        this.notificationsService.showErrorToastr(errMsg, errors?.en ? 10000 : 5000, 'brand-snackbar-2');
      });
  }

  private async deleteMultipleCargoFile() {
    if (!this.id) return;
    const req = await this.apiRestService.apiRest(null, `orders/cargo/remove-multiple/${this.id}`, {
      apiVersion: 'v1.1',
      timeout: '300000',
    });
    await req.toPromise();
  }

  public invalidFile() {
    this.notificationsService.showErrorToastr('Archivo inválido');
  }

  public createEmptyFile(fileName: string = '') {
    return new File([''], fileName ? this.getFileName(fileName) : 'empty.txt', { type: 'text/plain' });
  }

  public getFileName(filePath: string) {
    const regex = /\/[^/]*_([^/]+)$/;
    const match = filePath.match(regex);
    return match ? match[1] : '';
  }

  public fromOrder(order) {
    const newOrder = {
      ...order,
      metodo_de_pago: order.pricing?.deferred_payment ? 'PPD' : 'PUE',
    };

    // create keys if null
    if (!newOrder.invoice?.receiver) newOrder.invoice.receiver = {};

    if (order.destinations) {
      order.destinations.forEach((destination: any) => {
        destination.destination_id = destination._id;
        delete destination._id;
      });
    }

    if (order?.cargo?.imported_file) {
      const url: string = order.cargo.imported_file;

      this.files = {
        name: this.getFileName(url),
        date: new Date(),
        size: 0,
      };

      this.stepIndex = 1;
    }

    if (!newOrder.invoice?.receiver?.address)
      newOrder.invoice.receiver.address = {
        address: '',
        place_id: '',
      };

    return newOrder;
  }

  public units: number[] = [];
  public updateUnits(value: number[]) {
    this.vm.form.cargo.weight = value;
  }

  public selectedUnits(unit: any) {
    this.vm.form.cargo.trailer.load_cap = unit.value;
  }
}

const toOrder = (order: any) => {
  order.pricing.deferred_payment = order.metodo_de_pago === 'PPD';
  order.order_id = order._id;
  order.receiver = clone(order.invoice.receiver);

  delete order.invoice.receiver;
  delete order.metodo_de_pago;

  return order;
};

const orderPermissions = (order) => {
  // TODO: update hardcoded edit permission
  const edit = true;

  return {
    edit,
    readonly: !edit,
    hazardous: order?.cargo?.type === 'hazardous',
  };
};
