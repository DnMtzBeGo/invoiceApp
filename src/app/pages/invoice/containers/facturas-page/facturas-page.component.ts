import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import {
  interval,
  merge,
  timer,
  from,
  Subject,
  combineLatest,
  asapScheduler,
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
} from "rxjs/operators";
import { Router, ActivatedRoute } from "@angular/router";
import { routes } from "../../consts";
import { Paginator } from "../../models";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, oof } from "src/app/shared/utils/operators.rx";
import { arrayToObject, object_compare } from "src/app/shared/utils/object";
import { AuthService } from "src/app/shared/services/auth.service";

const parseNumbers = (str?: string) => {
  str = str || "";
  if (str === "") return [];
  return str.split(",").map(Number);
};

@Component({
  selector: "app-facturas-page",
  templateUrl: "./facturas-page.component.html",
  styleUrls: ["./facturas-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturasPageComponent implements OnInit {
  public routes: typeof routes = routes;
  $rx = reactiveComponent(this);

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
    ["refresh" | "filters:set" | "template:search" | "template:set", unknown?]
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
    private apiRestService: AuthService
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
      this.apiRestService.apiRest(
        JSON.stringify({
          ...params,
          ...fechas,
        }),
        "invoice",
        {
          loader: "false",
        }
      )
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

  //UTILS
  log = (...args: any[]) => {
    console.log(...args);
  };

  parseNumbers = parseNumbers;

  makeTemplate = (template: object) => {
    return encodeURIComponent(JSON.stringify(template));
  };

  decodeFecha = (strDate: string) => {
    return new Date(strDate);
  };
}
