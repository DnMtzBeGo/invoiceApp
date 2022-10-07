import {
  Component,
  OnInit,
  Inject,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatTable } from "@angular/material/table";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import {
  Observable,
  from,
  of,
  throwError,
  combineLatest,
  merge,
  timer,
  Subject,
  BehaviorSubject,
  asapScheduler,
} from "rxjs";
import {
  mergeAll,
  pluck,
  catchError,
  distinctUntilChanged,
  skip,
  debounceTime,
  share,
  switchMap,
  tap,
  map,
  mapTo,
  filter,
  takeUntil,
  withLatestFrom,
  scan,
  observeOn,
} from "rxjs/operators";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, oof, simpleFilters } from "src/app/shared/utils/operators.rx";
import { object_compare, clone } from "src/app/shared/utils/object";
import { makeRequestStream } from "src/app/shared/utils/http.rx";
import { AuthService } from "src/app/shared/services/auth.service";
import { NotificationsService } from "src/app/shared/services/notifications.service";
import { Paginator } from "../../models";
import {
  getImpuestoDescripcion,
  validators,
  optimizeInvoiceCatalog,
} from "../../containers/factura-edit-page/factura.core";
import { routes } from "../../consts";

interface FacturaImpuesto {
  cve_sat: string;
  es_retencion: boolean;
  tipo_factor: string;
  tasa_cuota?: number;
}

interface FacturaConcepto {
  _id?: string;
  nombre: string;
  cve_sat: string;
  unidad_de_medida: string;
  valor_unitario: number;
  descripcion: string;
  impuestos: FacturaImpuesto[];
  descuento?: number;
  cantidad?: number;
}

interface Config {
  mode: "index" | "edit";
  rfc: string;
  data?: FacturaConcepto;
  afterSuccessDelay?: Function;
}

@Component({
  selector: "app-factura-emisor-conceptos",
  templateUrl: "./factura-emisor-conceptos.component.html",
  styleUrls: ["./factura-emisor-conceptos.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturaEmisorConceptosComponent implements OnInit {
  public routes: typeof routes = routes;

  $rx = reactiveComponent(this);

  vm: {
    params?: {
      nombre?: string;
      limit?: string;
      page?: string;
    };
    conceptos?: unknown[];
    conceptosLoading?: boolean;
    helpTooltips?: any;
    impuesto?: any;
    form: FacturaConcepto;
    searchAction?: {
      type: "cve_sat";
      search: string;
      rfc?: string;
    };
    receptorSearch?: {
      cve_sat?: unknown[];
    };
    searchLoading?: boolean;
    catalogos?: {
      tipos_de_impuesto?: unknown[];
      unidades_de_medida?: unknown[];
    };
    formMode?: any;
    formId?: string;
    formLoading?: boolean;
    formError?: any;
    formSuccess?: any;
    impuestos?: unknown[];
    formImport?: {
      rfc: string;
      archivo?: File;
    };
    formImportLoading?: boolean;
    formImportError?: any;
    formImportSuccess?: any;
  };

  conceptoEmitter = new Subject<
    [
      (
        | "refresh"
        | "submit"
        | "submitImport"
        | "concepto:set"
        | "conceptos:search_cve"
        | "autocomplete:cancel"
        | "catalogos:search"
        | "impuestos:add"
        | "impuestos:remove"
      ),
      unknown?
    ]
  >();

  @ViewChild("myTable") myTable: MatTable<any>;

  paginator: Paginator = {
    pageIndex: 1,
    pageSize: 10,
    pageTotal: 1,
    pageSearch: "",
    total: 1,
  };

  public displayedColumns: string[] = ["nombre", "descripcion", "actions"];

  public sizeOptions = [5, 10, 15, 20];

  // emulated route
  route = {
    queryParams: new BehaviorSubject({}),
  };

  // FORM CONTORLS
  valor_unitario = new FormControl(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public config: Config,
    private dialogRef: MatDialogRef<FacturaEmisorConceptosComponent>,
    private notificationsService: NotificationsService,
    private apiRestService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    const loadDataAction$ = merge(
      this.$rx.afterViewInit$,
      this.conceptoEmitter.pipe(ofType("refresh"))
    );

    const params$ = merge(
      oof({}),
      this.route.queryParams.pipe(skip(1), debounceTime(500))
    ).pipe(
      distinctUntilChanged(object_compare),
      map((params) => ({
        ...params,
        limit: params.limit || this.paginator.pageSize,
        page: params.page || this.paginator.pageIndex,
        rfc: this.config.rfc,
      })),
      tap((params) => {
        this.paginator.pageSize = Number(params.limit);
        this.paginator.pageIndex = Number(params.page);
      }),
      share()
    );

    const conceptosRequest$ = combineLatest([loadDataAction$, params$]).pipe(
      pluck("1"),
      share()
    );

    const conceptos$ = combineLatest(
      conceptosRequest$.pipe(
        switchMap(this.fetchConceptos),
        tap((result) => {
          this.paginator.pageTotal = result.pages;
          this.paginator.total = result.size;
        }),
        pluck("result")
      )
    ).pipe(
      map(([conceptos]) => conceptos),
      tap(() => {
        this.myTable?.renderRows &&
          requestAnimationFrame(() => this.myTable.renderRows());
      }),
      share()
    );

    const conceptosLoading$ = merge(
      conceptosRequest$.pipe(mapTo(true)),
      conceptos$.pipe(mapTo(false))
    );

    const helpTooltips$ = this.fetchHelpTooltips();

    const catalogos$ = this.fetchCatalogosSAT().pipe(
      simpleFilters(
        this.conceptoEmitter.pipe(ofType("catalogos:search"), share())
      ),
      share()
    );

    //FORM
    const impuesto$ = merge(
      oof(null),
      this.conceptoEmitter.pipe(
        ofType("concepto:set"),
        map(() => null)
      )
    );

    const form$ = merge(
      oof(this.config.data).pipe(filter(Boolean)),
      this.conceptoEmitter.pipe(ofType("concepto:set"))
    ).pipe(
      map(clone),
      tap((form) => {
        this.config.mode = form == void 0 ? "index" : "edit";
      })
    );

    //FORM SUBMIT
    const formMode$ = this.conceptoEmitter.pipe(ofType("submit"), pluck("0"));
    const formId$: Observable<string> = this.conceptoEmitter.pipe(
      ofType("submit"),
      pluck("1")
    );
    const {
      loading$: formLoading$,
      error$: formError$,
      success$: formSuccess$,
    } = makeRequestStream({
      fetch$: this.conceptoEmitter.pipe(ofType("submit")),
      reset$: this.conceptoEmitter.pipe(
        ofType("concepto:set"),
        filter((form) => !Boolean(form))
      ),
      fetch: this.submitConcepto,
      afterSuccess: () => {},
      afterSuccessDelay: () => {
        // this.config.afterSuccessDelay?.();
        this.conceptoEmitter.next(["concepto:set", null]);
        this.conceptoEmitter.next(["refresh", ""]);

        if (this.vm.formMode === "delete") {
          this.config.mode = "index";
        }
      },
      afterError: (error) => {
        this.notificationsService.showErrorToastr(this.showError(error));
      },
    });

    //AUTOCOMPLETE
    const emptySearch = (search) => search.search === "";
    const validSearch = (search) => !emptySearch(search);

    const searchAction$ = merge(
      this.conceptoEmitter.pipe(
        ofType("conceptos:search_cve"),
        map((search: string) => ({ type: "cve_sat" as const, search }))
      )
    ).pipe(share());

    const cancelSearchAction$ = merge(
      searchAction$.pipe(filter(emptySearch)),
      this.conceptoEmitter.pipe(ofType("autocomplete:cancel")),
      this.conceptoEmitter.pipe(ofType("concepto:set"))
    );

    const validSearch$ = searchAction$.pipe(
      filter(validSearch),
      switchMap((search) =>
        timer(500).pipe(takeUntil(cancelSearchAction$), mapTo(search))
      )
    );

    const searchRequest$ = validSearch$.pipe(
      switchMap((search) =>
        this.searchReceptor(search).pipe(takeUntil(cancelSearchAction$))
      ),
      share()
    );

    const searchLoading$ = merge(
      oof(false),
      validSearch$.pipe(mapTo(true)),
      searchRequest$.pipe(mapTo(false)),
      cancelSearchAction$.pipe(mapTo(false))
    );

    const receptorSearch$ = merge(
      searchRequest$.pipe(
        withLatestFrom(searchAction$),
        map(([requestData, search]: any) => ({
          [search.type]: requestData,
        }))
      ),
      cancelSearchAction$.pipe(mapTo({}))
    );

    //IMPUESTOS
    const impuestos$ = form$.pipe(
      filter(Boolean),
      pluck("impuestos"),
      switchMap((impuestos) =>
        merge(
          of(1).pipe(map(() => (state) => clone(impuestos))),
          this.conceptoEmitter.pipe(
            // required for reset controls
            observeOn(asapScheduler),
            ofType("impuestos:add"),
            map((impuesto) => (state) => [...state, clone(impuesto)]),
            tap(() => {
              // reset impuesto controls
              // this.resetImpuestoControls();
            })
          ),
          this.conceptoEmitter.pipe(
            ofType("impuestos:remove"),
            map((index) => (state) => state.filter((_, i) => i !== index))
          )
        ).pipe(
          scan((state, f) => f(state), []),
          tap((impuestos) => (this.vm.form.impuestos = impuestos))
        )
      )
    );

    //FORM IMPORT
    const formImport$ = oof({
      rfc: this.config.rfc,
      archivo: null,
    });

    //FORM IMPORT SUBMIT
    const {
      loading$: formImportLoading$,
      error$: formImportError$,
      success$: formImportSuccess$,
    } = makeRequestStream({
      fetch$: this.conceptoEmitter.pipe(ofType("submitImport")),
      fetch: this.submitFormImport,
      afterSuccessDelay: () => {
        this.config.afterSuccessDelay?.();
        this.conceptoEmitter.next(["refresh", ""]);
      },
      afterError: (error) => {
        this.notificationsService.showErrorToastr(this.showError(error));
      },
    });

    this.vm = this.$rx.connect({
      params: params$,
      conceptos: conceptos$,
      conceptosLoading: conceptosLoading$,
      helpTooltips: helpTooltips$,
      catalogos: catalogos$,
      impuesto: impuesto$,
      form: form$,
      formMode: formMode$,
      formId: formId$,
      formLoading: formLoading$,
      formError: formError$,
      formSuccess: formSuccess$,
      searchAction: searchAction$,
      receptorSearch: receptorSearch$,
      searchLoading: searchLoading$,
      impuestos: impuestos$,
      formImport: formImport$,
      formImportLoading: formImportLoading$,
      formImportError: formImportError$,
      formImportSuccess: formImportSuccess$,
    });
  }

  createForm() {
    return {
      rfc: this.config.rfc,
      nombre: "",
      cve_sat: "",
      unidad_de_medida: "",
      valor_unitario: "",
      descripcion: "",
      impuestos: [],
    };
  }

  closeModal() {
    this.dialogRef.close([this.config]);
  }

  //API calls
  fetchConceptos = (params) => {
    params = clone(params);
    const rfc = params.rfc;
    delete params.rfc;

    return from(
      this.apiRestService.apiRest(
        JSON.stringify({ rfc, pagination: params }),
        "invoice/concepts",
        {
          loader: "false",
        }
      )
    ).pipe(mergeAll(), pluck("result"));
  };

  fetchCatalogosSAT() {
    return from(
      this.apiRestService.apiRestGet("invoice/catalogs/invoice")
    ).pipe(mergeAll(), pluck("result"), map(optimizeInvoiceCatalog));
  }

  fetchHelpTooltips() {
    return oof(this.translateService.instant("invoice.tooltips"));
  }

  searchReceptor(search) {
    const endpoints = {
      cve_sat: "invoice/catalogs/productos-y-servicios",
    };
    const keys = {
      cve_sat: "term",
    };

    if (["cve_sat"].includes(search.type)) {
      return from(
        this.apiRestService.apiRestGet(endpoints[search.type], {
          loader: "false",
          [keys[search.type]]: search.search,
          limit: 15,
        })
      ).pipe(mergeAll(), pluck("result", "productos_servicios"));
    }

    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          [keys[search.type]]: search.search,
          limit: 10,
        }),
        endpoints[search.type],
        { loader: "false" }
      )
    ).pipe(mergeAll(), pluck("result"));
  }

  submitConcepto = ([mode, _id, form]) => {
    return from(
      this.apiRestService.apiRest(
        JSON.stringify(form),
        `invoice/concepts/${mode}`,
        {
          loader: "false",
        }
      )
    ).pipe(mergeAll());
  };

  submitFormImport = (form) => {
    const formData = new FormData();
    formData.append("rfc", form.rfc);
    formData.append("archivo", form.archivo);

    return from(
      this.apiRestService.uploadFilesSerivce(
        formData,
        "invoice/concepts/import",
        {
          loader: "false",
        }
      )
    ).pipe(mergeAll());
  };

  //Paginator
  public pageChangeEmiter(page: number = 1) {
    this.paginator.pageIndex = page;
    this.route.queryParams.next({
      ...this.route.queryParams.getValue(),
      limit: this.paginator.pageSize,
      page: this.paginator.pageIndex,
    });
  }

  public pagination(page: number) {
    this.pageChangeEmiter(page);
  }

  // UTILS
  log = (...args) => {
    console.log(...args);
  };

  showError = (error: any) => {
    error = error?.message || error?.error;

    return Array.isArray(error) ? error.map((e) => e.error).join(",\n") : error;
  };

  compareImpuesto = (a, b) => {
    return a != void 0 && b != void 0 && a.descripcion === b.descripcion;
  };

  clone = clone;

  getImpuestoDescripcion = getImpuestoDescripcion;

  v = validators;
}
