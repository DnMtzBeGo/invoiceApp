import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from "@angular/core";
import {
  interval,
  merge,
  timer,
  from,
  Subject,
  combineLatest,
  asapScheduler,
  of,
} from "rxjs";
import {
  mapTo,
  mergeAll,
  pluck,
  debounceTime,
  share,
  observeOn,
  repeatWhen,
  switchMap,
  delay,
  map,
  catchError,
  withLatestFrom,
  tap,
  distinctUntilChanged,
  skip,
  filter,
  takeUntil,
  startWith,
} from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { Router, ActivatedRoute } from "@angular/router";
import { NotificationsService } from "src/app/shared/services/notifications.service";
import { routes } from "../../consts";
import { Paginator } from "../../models";
import {
  FacturaFiltersComponent,
  ActionConfirmationComponent,
} from "../../modals";
import { FacturaEmitterComponent } from "../../components/factura-emitter/factura-emitter.component";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, oof } from "src/app/shared/utils/operators.rx";
import {
  arrayToObject,
  object_compare,
  clone,
} from "src/app/shared/utils/object";
import { AuthService } from "src/app/shared/services/auth.service";

const filterParams = new Set([
  "fec_inicial",
  "fec_final",
  "emisor",
  "receptor",
  "tipo_de_comprobante",
  "uuid",
  "status",
]);

const status2observe = new Set([2, 4]);
const observeTime = 5000;
const shouldObserve = (facturas) =>
  facturas.some((factura) => status2observe.has(factura.status));

@Component({
  selector: "app-facturas-page",
  templateUrl: "./facturas-page.component.html",
  styleUrls: ["./facturas-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FacturasPageComponent implements OnInit {
  public routes: typeof routes = routes;
  $rx = reactiveComponent(this);

  private filtersDialogRef;

  vm!: {
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
      type: "template";
      search: string;
    };
    searchLoading?: boolean;
    receptorSearch?: {
      template?: unknown[];
    };
  };

  facturasEmitter = new Subject<
    [
      (
        | "refresh"
        | "filters:set"
        | "template:search"
        | "template:set"
        | "refresh:defaultEmisor"
      ),
      unknown?
    ]
  >();

  paginator: Paginator = {
    pageIndex: +this.route.snapshot.queryParams.page || 1,
    pageSize: +this.route.snapshot.queryParams.limit || 10,
    pageTotal: 1,
    pageSearch: "",
  };

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private matDialog: MatDialog,
    private apiRestService: AuthService,
    private translateService: TranslateService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit(): void {
    const loadDataAction$ = merge(
      oof(""),
      this.facturasEmitter.pipe(ofType("refresh"))
    );

    const tiposComprobante$ = this.fetchTipoComprobante().pipe(share());

    const facturaStatus$ = this.fetchFacturaStatus().pipe(share());

    const params$ = merge(
      oof(this.route.snapshot.queryParams),
      this.route.queryParams.pipe(skip(1), debounceTime(500))
    ).pipe(
      distinctUntilChanged(object_compare),
      map((params: any) => ({
        ...params,
        limit: params.limit || this.paginator.pageSize,
        page: params.page || this.paginator.pageIndex,
        fec_inicial: params.fec_inicial
          ? this.decodeFecha(params.fec_inicial)
          : null,
        fec_final: params.fec_final ? this.decodeFecha(params.fec_final) : null,
      })),
      tap((params) => {
        this.paginator.pageSize = Number(params.limit);
        this.paginator.pageIndex = Number(params.page);
      }),
      share()
    );

    const facturasRequest$ = combineLatest([loadDataAction$, params$]).pipe(
      pluck("1"),
      share()
    );

    const facturas$ = combineLatest(
      tiposComprobante$.pipe(map(arrayToObject("clave", "descripcion"))),
      facturaStatus$.pipe(map(arrayToObject("clave", "nombre"))),
      facturasRequest$.pipe(
        switchMap(this.fetchFacturas),
        tap((result) => {
          this.paginator.pageTotal = result.pages;
          this.paginator.total = result.size;
        }),
        pluck("invoices")
      )
    ).pipe(
      map(([tiposComprobante, facturaStatus, facturas]: any) =>
        facturas.map((factura: any) => ({
          ...factura,
          tipo_de_comprobante_:
            tiposComprobante[factura.tipo_de_comprobante] ||
            factura.tipo_de_comprobante,
          status_: facturaStatus[factura.status] || factura.status,
        }))
      ),
      share()
    );

    const facturasLoading$ = merge(
      facturasRequest$.pipe(mapTo(true)),
      facturas$.pipe(mapTo(false))
    );

    const refreshTimer$ = facturas$.pipe(
      switchMap((facturas) =>
        shouldObserve(facturas)
          ? timer(observeTime).pipe(
              mapTo(1),
              tap(() => this.facturasEmitter.next(["refresh"]))
            )
          : of(0)
      )
    );

    // EMISORES
    const defaultEmisor$ = this.fetchEmisores().pipe(
      repeatWhen(() =>
        this.facturasEmitter.pipe(ofType("refresh:defaultEmisor"))
      )
    );

    //TEMPLATES
    const emptySearch = (search: any) => search.search === "";
    const validSearch = (search: any) => !emptySearch(search);

    const template$ = oof("");

    const searchAction$ = merge(
      this.facturasEmitter.pipe(
        ofType("template:search"),
        map((search: string) => ({ type: "template" as const, search }))
      )
    ).pipe(share());

    const cancelSearchAction$ = merge(
      searchAction$.pipe(filter(emptySearch)),
      this.facturasEmitter.pipe(ofType("template:set"))
    );

    const validSearch$ = searchAction$.pipe(
      filter(validSearch),
      switchMap((search) =>
        timer(500).pipe(takeUntil(cancelSearchAction$), mapTo(search))
      )
    );

    const searchRequest$ = validSearch$.pipe(
      switchMap((search) =>
        this.searchTemplate(search).pipe(takeUntil(cancelSearchAction$))
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
  fetchFacturas = (params: any) => {
    params = { ...params };

    const fechas =
      (params.fec_inicial &&
        params.fec_final && {
          fec_inicial: params.fec_inicial ? String(params.fec_inicial) : "",
          fec_final: params.fec_final
            ? (params.fec_final.setHours(23, 59, 59), String(params.fec_final))
            : "",
        }) ||
      {};

    delete params.fec_inicial;
    delete params.fec_final;

    return from(
      this.apiRestService.apiRestGet("invoice", {
        loader: "false",
        ...params,
        ...fechas,
      })
    ).pipe(mergeAll(), pluck("result"));
  };

  fetchTipoComprobante() {
    return from(
      this.apiRestService.apiRestGet("invoice/catalogs/tipos-de-comprobante", {
        loader: "false",
      })
    ).pipe(mergeAll(), pluck("result"));
  }

  fetchFacturaStatus = () => {
    return from(
      this.apiRestService.apiRestGet("invoice/catalogs/statuses", {
        loader: "false",
      })
    ).pipe(mergeAll(), pluck("result"));
  };

  fetchEmisores() {
    return from(
      this.apiRestService.apiRestGet("invoice/emitters", {
        loader: "false",
      })
    ).pipe(
      mergeAll(),
      map((responseData) => {
        const emisores = responseData?.result?.documents;

        // return void 0;
        // return [];

        if (emisores == void 0) return void 0;

        return emisores.length === 0 ? [] : [emisores.pop()];
      }),
      startWith(null)
    );
  }

  searchTemplate(search: { type: "template"; search: string }) {
    const endpoints = {
      template: "invoice/get_drafts",
    };
    const keys = {
      template: "search",
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
        { loader: "false" }
      )
    ).pipe(mergeAll(), pluck("result"));
  }

  // MODALS
  openFilters() {
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
      backdropClass: ["brand-dialog-1", "dialog-filters"],
      position: {
        top: "12.5rem",
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
        queryParamsHandling: "merge",
      });
    });
  }

  noEmisorAlert() {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: this.translateService.instant(
          "invoice.invoices.noemisor-title"
        ),
        modalMessage: this.translateService.instant(
          "invoice.invoices.noemisor-message"
        ),
        confirm: this.translateService.instant(
          "invoice.invoices.noemisor-confirm"
        ),
      },
      restoreFocus: false,
      backdropClass: ["brand-dialog-1"],
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((res?) => {
      res && this.createEditEmisor();
    });
  }

  createEditEmisor(emisor?) {
    const dialogRef = this.matDialog.open(FacturaEmitterComponent, {
      data: emisor,
      restoreFocus: false,
      autoFocus: false,
      disableClose: true,
      backdropClass: ["brand-dialog-1"],
    });

    dialogRef.afterClosed().subscribe((result?) => {
      if (result?.success === true) {
        this.facturasEmitter.next(["refresh:defaultEmisor"]);
      }
    });
  }

  //UTILS
  log = (...args: any[]) => {
    console.log(...args);
  };

  makeTemplate = (template: object) => {
    return encodeURIComponent(JSON.stringify(template));
  };

  decodeFecha = (strDate: string) => {
    return new Date(strDate);
  };

  filtersCount = (params = {}) =>
    Object.keys(params).filter(
      (filterName) => filterParams.has(filterName) && params[filterName]
    ).length || null;
}
