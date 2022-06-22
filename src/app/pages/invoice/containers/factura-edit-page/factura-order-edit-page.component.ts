import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import {
  of,
  timer,
  Subject,
  merge,
  from,
  combineLatest,
  NEVER,
  Observable,
  asapScheduler,
  animationFrameScheduler,
} from "rxjs";
import {
  observeOn,
  mapTo,
  tap,
  filter,
  debounceTime,
  switchMap,
  share,
  map,
  withLatestFrom,
  takeUntil,
  mergeAll,
  startWith,
  pluck,
  distinctUntilChanged,
  take,
  scan,
  catchError,
  repeatWhen,
} from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments/environment";
import omitEmpty from "omit-empty";
import { AuthService } from "src/app/shared/services/auth.service";
import { NotificationsService } from "src/app/shared/services/notifications.service";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, simpleFilters, oof } from "src/app/shared/utils/operators.rx";
import { makeRequestStream } from "src/app/shared/utils/http.rx";
import {
  clone,
  arrayToObject,
  object_compare,
} from "src/app/shared/utils/object";
import { routes } from "../../consts";
import {
  calcImporte,
  calcConcepto,
  calcSubtotal,
  calcDescuentos,
  calcTotal,
  resolveImpuesto,
  resolveImpuestoLabel,
  resolveImpuestosGroup,
  fromFactura,
  toFactura,
  fromFacturaCopy,
  validRFC,
  getImpuestoDescripcion,
  previewFactura,
  validators,
  facturaStatus,
  optimizeInvoiceCatalog,
} from "./factura.core";
import { ActionConfirmationComponent } from "../../modals";
import { BegoSliderDotsOpts } from "src/app/shared/components/bego-slider-dots/bego-slider-dots.component";

@Component({
  selector: "app-factura-order-edit-page",
  templateUrl: "./factura-order-edit-page.component.html",
  styleUrls: ["./factura-edit-page.component.scss"],
  encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturaOrderEditPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public URL_BASE = environment.URL_BASE;
  public token = localStorage.getItem("token") || "";

  $rx = reactiveComponent(this);

  vm: {
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
        };
      };
      pricing?: {
        subtotal: number;
        deferred_payment: boolean;
      };
      pickup?: {
        contact_info?: {
          rfc?: string;
        };
      };
      dropoff?: {
        contact_info?: {
          rfc: string;
        };
      };
      cargo?: {
        cargo_goods: string;
        commodity_quantity: number;
        unit_type: string;
        packaging: string;
        hazardous_material: string;
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
    };
    helpTooltips?: any;
    facturaStatus?: unknown;
    searchAction?: {
      type: "rfc" | "nombre" | "cve_sat";
      search: string;
      rfc?: string;
    };
    receptorSearch?: {
      rfc?: unknown[];
      nombre?: unknown[];
      cve_sat?: unknown[];
    };
    tipoPersona?: "fisica" | "moral";
    searchLoading?: boolean;
    direcciones?: unknown[];
    direccion?: any;
    estados?: unknown[];
    municipios?: unknown[];
    colonias?: unknown[];
    tipo_de_comprobante?: any;
    impuesto?: any;
    concepto?: {
      clave: string;
      nombre: string;
      cve_sat: string;
      unidad_de_medida: string;
      cantidad: number;
      valor_unitario: number;
      descuento: number;
      descripcion: string;
      impuestos: {
        cve_sat: string;
        tipo_factor: string;
        es_retencion: boolean;
        tasa_cuota: number;
      }[];
      _edit?: number;
    };
    conceptos?: unknown[];
    uuid?: string;
    formMode?: any;
    formLoading?: boolean;
    formError?: any;
    formSuccess?: any;
  };

  formEmitter = new Subject<
    [
      (
        | "tab"
        | "refresh"
        | "rfc:search"
        | "nombre:search"
        | "autocomplete:cancel"
        | "rfc:set"
        | "catalogos:search"
        | "direcciones:reload"
        | "direccion:select"
        | "pais:select"
        | "estado:select"
        | "cp:input"
        | "tipo_de_comprobante:select"
        | "impuestos:add"
        | "impuestos:remove"
        | "conceptos:search_cve"
        | "conceptos:add"
        | "conceptos:edit"
        | "concepto:set"
        | "conceptos:remove"
        | "openCartaporte"
        | "submit"
      ),
      unknown
    ]
  >();

  id;
  mode: "create" | "update";
  model: "order" = "order";
  tabs = ["receptor", "precio", "orden"];
  sliderDotsOpts: BegoSliderDotsOpts = {
    totalElements: this.tabs.length,
    value: 0,
    // valueChange: (slideIndex: number): void => {
    //   this.sliderDotsOpts.value = slideIndex;
    //   this.formEmitter.next(["tab", this.tabs[slideIndex]]);
    // },
  };

  // FORM CONTORLS
  valor_unitario = new FormControl(null);
  cantidad = new FormControl(null);
  descuento = new FormControl(null);

  constructor(
    private router: Router,
    private apiRestService: AuthService,
    private notificationsService: NotificationsService,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    //TAB
    const tab$ = merge(
      of("receptor"),
      (this.formEmitter.pipe(ofType("tab")) as Observable<string>).pipe(
        distinctUntilChanged(),
        map((tab) => {
          const tabIndex = isNaN(parseInt(tab))
            ? this.tabs.indexOf(tab)
            : Number(tab);
          tab = isNaN(parseInt(tab)) ? tab : this.tabs[tabIndex];

          this.sliderDotsOpts.value = tabIndex;
          this.vm.readonly &&
            window.scrollTo({
              top: 112 + window.document.getElementById(tab)?.offsetTop - 16,
              behavior: "smooth",
            });

          return tab;
        })
      )
    );

    //DATA FETCHING
    const loadDataAction$ = merge(
      oof(""),
      this.formEmitter.pipe(ofType("refresh"))
    );

    const form$ = loadDataAction$.pipe(
      tap(() => {
        //ROUTE INFO
        this.id = this.route.snapshot.paramMap.get("id");
        this.mode = this.id == null ? "create" : "update";
      }),
      switchMap(() => {
        return this.mode === "create"
          ? this.createForm()
          : this.fetchForm(this.id);
      }),
      share()
    );

    const readonly$ = merge(
      loadDataAction$.pipe(
        map(() => ({
          status: Number(this.route.snapshot.paramMap.get("status")),
        }))
      ),
      form$
    ).pipe(map(orderPermissions), pluck("readonly"), distinctUntilChanged());
    const catalogos$ = this.fetchCatalogosSAT().pipe(
      simpleFilters(this.formEmitter.pipe(ofType("catalogos:search"), share())),
      share()
    );
    const helpTooltips$ = this.fetchHelpTooltips();

    //RECEPTOR
    const emptySearch = (search) => search.search === "";
    const validSearch = (search) => !emptySearch(search);
    const getTipoPersona = (rfc) =>
      rfc?.length === 12 ? "moral" : rfc?.length === 13 ? "fisica" : null;
    const normalizeRFC = (rfc: string) => rfc.toUpperCase().trim();

    const searchAction$ = merge(
      this.formEmitter.pipe(
        ofType("rfc:search"),
        map((search: string) => ({ type: "rfc" as const, search })),
        tap(() => {
          // this.vm.form.invoice.receiver.company = "";
          // this.vm.form.invoice.receiver.cfdi = "";
          // this.vm.form.invoice.receiver.tax_regime = "";
          // this.vm.form.invoice.receiver.address = {};
        })
      ),
      this.formEmitter.pipe(
        ofType("nombre:search"),
        map((search: string) => ({ type: "nombre" as const, search }))
      ),
      this.formEmitter.pipe(
        ofType("conceptos:search_cve"),
        map((search: string) => ({ type: "cve_sat" as const, search }))
      )
    ).pipe(share());

    const cancelSearchAction$ = merge(
      searchAction$.pipe(filter(emptySearch)),
      this.formEmitter.pipe(ofType("autocomplete:cancel"))
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

    const receptorRFC$ = merge(
      form$.pipe(pluck("invoice", "receiver", "rfc")),
      this.formEmitter.pipe(ofType("rfc:search")),
      this.formEmitter.pipe(ofType("rfc:set"), map(normalizeRFC))
    ).pipe(share());

    const tipoPersona$ = receptorRFC$.pipe(
      distinctUntilChanged(),
      map(getTipoPersona)
    );

    //DIRECCION
    const direcciones$ = receptorRFC$.pipe(
      // tap((rfc) => {
      //   this.manageDirecciones({
      //     model: "receptor",
      //     rfc,
      //   });
      // }),
      switchMap((rfc) =>
        this.fetchDirecciones(rfc).pipe(
          repeatWhen(() => this.formEmitter.pipe(ofType("direcciones:reload")))
        )
      ),
      share()
    );

    const direccion$ = merge(
      form$.pipe(pluck("invoice", "receiver", "address")),
      this.formEmitter.pipe(
        ofType("direccion:select"),
        map(
          (direccion: object) =>
            (this.vm.form.invoice.receiver.address = clone(direccion))
        )
      )
    );

    //FORM SUBMIT
    const formMode$ = this.formEmitter.pipe(ofType("submit"), pluck("1"));

    const {
      loading$: formLoading$,
      error$: formError$,
      success$: formSuccess$,
    } = makeRequestStream({
      fetch$: this.formEmitter.pipe(ofType("submit")),
      fetch: this.submitFactura,
      afterSuccess: (data) => {},
      afterSuccessDelay: (data) => {
        (this.route.snapshot.paramMap.get("redirectTo") &&
          this.router.navigateByUrl(
            this.route.snapshot.paramMap.get("redirectTo")
          )) ||
          this.router.navigate([routes.FACTURAS]);
      },
      afterError: () => {
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
      helpTooltips: helpTooltips$,
      searchAction: searchAction$,
      receptorSearch: receptorSearch$,
      tipoPersona: tipoPersona$,
      searchLoading: searchLoading$,
      direcciones: direcciones$,
      direccion: direccion$,
      formMode: formMode$,
      formLoading: formLoading$,
      formError: formError$,
      formSuccess: formSuccess$,
    });
  }

  createForm() {
    return of({
      invoice: {
        receiver: {
          address: {
            place_id: "",
            address: "",
          },
          company: "",
          rfc: "",
          cfdi: "",
          tax_regime: "",
        },
      },
      pickup: {
        contact_info: {
          rfc: "",
        },
      },
      dropoff: {
        contact_info: {
          rfc: "",
        },
      },
      cargo: {
        cargo_goods: "",
        commodity_quantity: 0,
        unit_type: "",
        packaging: "",
        hazardous_material: "",
      },
      pricing: {
        subtotal: 0,
        deferred_payment: false,
      },
    });
  }

  // API calls
  fetchForm(_id) {
    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          order_id: _id,
        }),
        "orders/get_by_id",
        { loader: "false" }
      )
    ).pipe(
      mergeAll(),
      map((responseData) => fromOrder(responseData?.result))
    );
  }

  fetchCatalogosSAT() {
    // h7xma29J$
    // AUZM911206E49
    return from(
      this.apiRestService.apiRestGet("invoice/catalogs/invoice")
    ).pipe(mergeAll(), pluck("result"), map(optimizeInvoiceCatalog));
  }

  fetchHelpTooltips() {
    return oof(this.translateService.instant("invoice.tooltips"));
  }

  fetchLugaresExpedicion = (rfc: string) => {
    return rfc == void 0 || rfc === "" || !validRFC(rfc)
      ? of([])
      : from(
          this.apiRestService.apiRest(
            JSON.stringify({
              rfc,
            }),
            "invoice/expedition-places",
            {
              loader: "false",
            }
          )
        ).pipe(mergeAll(), pluck("result"), startWith(null));
  };

  searchReceptor(search) {
    const endpoints = {
      rfc: "invoice/receivers",
      nombre: "invoice/receivers/by-name",
      cve_sat: "invoice/catalogs/consignment-note/productos-y-servicios",
    };
    const keys = {
      rfc: "rfc",
      nombre: "name",
      cve_sat: "term",
    };

    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          [keys[search.type]]: search.search,
          limit: 15,
          ...(search.rfc != void 0 ? { rfc: search.rfc } : {}),
        }),
        endpoints[search.type],
        { loader: "false" }
      )
    ).pipe(mergeAll(), pluck("result"));
  }

  fetchDirecciones = (rfc?) => {
    return rfc == void 0 || rfc === "" || !validRFC(rfc)
      ? of([])
      : from(
          this.apiRestService.apiRest(
            JSON.stringify({
              rfc,
            }),
            "invoice/branch-offices",
            { loader: "false" }
          )
        ).pipe(mergeAll(), pluck("result"), startWith(null));
  };

  submitFactura = ([mode, saveMode, factura]) => {
    factura = clone(factura);

    const data = { orderInfo: toOrder(factura) };

    return from(
      this.apiRestService.apiRest(
        JSON.stringify(data),
        "orders/update_consignment_note_info",
        {
          loader: "false",
        }
      )
    ).pipe(
      mergeAll(),
      // NOTE: wrap success response
      map((responseData) => ({
        result: responseData,
      }))
    );
  };

  // MODALS

  // FORMS
  resetConceptoControls() {
    this.valor_unitario.reset();
    this.cantidad.reset();
    this.descuento.reset();
  }

  // UTILS
  clone = clone;

  log = (...args) => {
    console.log(...args);
  };

  showError = (error: any) => {
    error = error?.message || error?.error;
    // lang
    error = error?.[this.translateService.currentLang];

    return Array.isArray(error)
      ? error.map((e) => e.error ?? e.message).join(",\n")
      : error;
  };

  compareImpuesto = (a, b) => {
    return a != void 0 && b != void 0 && a.descripcion === b.descripcion;
  };

  compareId = (a, b) => {
    return a != void 0 && b != void 0 && a._id === b._id;
  };

  validRFC = validRFC;

  getImpuestoDescripcion = getImpuestoDescripcion;

  calcImporte = calcImporte;

  calcConcepto = calcConcepto;

  calcSubtotal = calcSubtotal;

  calcDescuentos = calcDescuentos;

  calcTotal = calcTotal;

  resolveImpuesto = resolveImpuesto;

  resolveImpuestoLabel = resolveImpuestoLabel;

  resolveImpuestosGroup = resolveImpuestosGroup;

  p = orderPermissions;

  Boolean = Boolean;

  JSON = window.JSON;

  toFactura = toFactura;

  resolveUrl = (commands: any[]) => {
    return this.router.serializeUrl(this.router.createUrlTree(commands));
  };

  findById = (_id: string) => (item) => item._id === _id;

  v = validators;

  facturaStatus = facturaStatus;
}

const fromOrder = (order) => {
  const newOrder = {
    ...order,
    metodo_de_pago: order.pricing?.deferred_payment ? "PPD" : "PUE",
  };

  // create keys if null
  if (!newOrder.invoice?.receiver) newOrder.invoice.receiver = {};

  if (!newOrder.invoice?.receiver?.address)
    newOrder.invoice.receiver.address = {
      address: "",
      place_id: "",
    };

  return newOrder;
};

const toOrder = (order: any) => {
  order.pricing.deferred_payment = order.metodo_de_pago === "PPD";
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
  };
};
