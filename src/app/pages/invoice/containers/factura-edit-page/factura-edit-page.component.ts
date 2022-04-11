import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
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
import { environment } from "src/environments/environment";
import omitEmpty from "omit-empty";
// import {
//   ApiRestService,
//   NotificationsService,
// } from "../../../../core/services";
import { AuthService } from "src/app/shared/services/auth.service";
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
  facturaPermissions,
  previewFactura,
  validators,
  facturaStatus,
  helpTooltips,
} from "./factura.core";
import {
  ActionSendEmailFacturaComponent,
  ActionCancelarFacturaComponent,
  ActionConfirmationComponent,
  FacturaEmisorConceptosComponent,
  FacturaManageDireccionesComponent,
} from "../../modals";
// import { SeriesNewComponent } from "../../components/series-new/series-new.component";

@Component({
  selector: "app-factura-edit-page",
  templateUrl: "./factura-edit-page.component.html",
  styleUrls: ["./factura-edit-page.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturaEditPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public URL_BASE = environment.URL_BASE;
  public token = localStorage.getItem("token") || "";

  $rx = reactiveComponent(this);

  vm: {
    form?: {
      _id?: string;
      status?: number;
      created_at?: string;
      error?: any[];
      // rfc
      rfc: string;
      nombre: string;
      usoCFDI: string;
      // direccion
      direccion: any;
      // emisor
      emisor: {
        _id?: string;
        rfc: string;
        nombre: string;
        regimen_fiscal: string;
      };
      lugar_de_expedicion: any;
      tipo_de_comprobante: string;
      moneda: string;
      metodo_de_pago: string;
      forma_de_pago: string;
      condiciones_de_pago: string;
      info_extra: string;
      // conceptos
      conceptos: unknown[];
      // documentos relacionados
      tipo_de_relacion: string;
      documentos_relacionados: unknown[];
      // serie
      serie: string;
      // links
      files?: {
        xml?: string;
        pdf?: string;
        pdf_cancelado?: string;
        xml_acuse?: string;
      };
      // template
      name?: string;
    };
    emisor?: {
      rfc: string;
      nombre: string;
      tipoPersona?: "fisica" | "moral";
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
    lugaresExpedicion?: unknown[];
    series?: unknown[];
    paises?: unknown[];
    facturaStatus?: unknown;
    searchAction?: {
      type:
        | "rfc"
        | "nombre"
        | "rfcEmisor"
        | "nombreEmisor"
        | "concepto_nombre"
        | "cve_sat";
      search: string;
      rfc?: string;
    };
    receptorSearch?: {
      rfc?: unknown[];
      nombre?: unknown[];
      rfcEmisor?: unknown[];
      nombreEmisor?: unknown[];
      concepto_nombre?: unknown[];
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
    };
    conceptos?: unknown[];
    uuid?: string;
    formMode?: any;
    isCartaporte?: any;
    formLoading?: boolean;
    formError?: any;
    formSuccess?: any;
  };

  formEmitter = new Subject<
    [
      (
        | "refresh"
        | "rfc:search"
        | "nombre:search"
        | "autocomplete:cancel"
        | "rfc:set"
        | "catalogos:search"
        | "rfcEmisor:search"
        | "rfcEmisor:set"
        | "nombreEmisor:search"
        | "lugaresExpedicion:reload"
        | "direcciones:reload"
        | "direccion:select"
        | "pais:select"
        | "estado:select"
        | "cp:input"
        | "tipo_de_comprobante:select"
        | "impuestos:add"
        | "impuestos:remove"
        | "conceptos:search_nombre"
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
  model: "factura" | "template" = this.route.snapshot?.data.model;

  // FORM CONTORLS
  valor_unitario = new FormControl(null);
  cantidad = new FormControl(null);
  descuento = new FormControl(null);

  constructor(
    private router: Router,
    private apiRestService: AuthService,
    // private notificationsService: NotificationsService,
    private route: ActivatedRoute,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
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
        const template = this.route.snapshot.paramMap.get("template");

        return template
          ? /^\w+$/.test(template) // isID
            ? this.fetchForm(template).pipe(map(fromFacturaCopy))
            : this.createForm().pipe(
                map((form) => ({
                  ...toFactura(form),
                  ...fromFacturaCopy(JSON.parse(decodeURIComponent(template))),
                })),
                map(fromFactura)
              )
          : this.mode === "create"
          ? this.createForm()
          : this.fetchForm(this.id);
      }),
      share()
    );

    const emisor$ = merge(
      form$.pipe(
        pluck("emisor"),
        filter(Boolean)
        // tap(({ rfc }) =>
        //   this.emisorConceptos({
        //     mode: 'index',
        //     rfc,
        //   })
        // )
      ),
      this.formEmitter.pipe(
        ofType("rfcEmisor:set"),
        map((emisor: any) => {
          return {
            ...emisor,
            rfc: normalizeRFC(emisor.rfc),
          };
        })
      ),
      this.formEmitter.pipe(
        ofType("rfcEmisor:search"),
        // filter(validRFC),
        map((rfc) => ({
          rfc,
          nombre: "",
          regimen_fiscal: "",
        }))
      )
    ).pipe(
      map((emisor) => ({
        ...emisor,
        tipoPersona: getTipoPersona(emisor.rfc),
      })),
      share()
    );

    const readonly$ = merge(
      loadDataAction$.pipe(
        map(() => ({
          status: Number(this.route.snapshot.paramMap.get("status")),
        }))
      ),
      form$
    ).pipe(map(facturaPermissions), pluck("readonly"), distinctUntilChanged());
    const catalogos$ = this.fetchCatalogosSAT().pipe(
      simpleFilters(this.formEmitter.pipe(ofType("catalogos:search"), share())),
      share()
    );
    const helpTooltips$ = this.fetchHelpTooltips();
    const series$ = emisor$.pipe(pluck("rfc"), switchMap(this.fetchSeries));
    const paises$ = this.fetchPaises();
    const facturaStatus$ = this.fetchFacturaStatus().pipe(
      map(arrayToObject("clave", "nombre")),
      share()
    );

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
          this.vm.form.usoCFDI = "";
          this.vm.form.nombre = "";
          this.vm.form.direccion = {};
        })
      ),
      this.formEmitter.pipe(
        ofType("nombre:search"),
        map((search: string) => ({ type: "nombre" as const, search }))
      ),
      this.formEmitter.pipe(
        ofType("rfcEmisor:search"),
        map((search: string) => ({ type: "rfcEmisor" as const, search })),
        tap(() => {
          delete this.vm.form.emisor._id;
          this.vm.form.emisor.nombre = "";
          this.vm.form.emisor.regimen_fiscal = "";
          this.vm.form.serie = "";
          this.vm.form.lugar_de_expedicion = {};
        })
      ),
      this.formEmitter.pipe(
        ofType("nombreEmisor:search"),
        map((search: string) => ({ type: "nombreEmisor" as const, search }))
      ),
      this.formEmitter.pipe(
        ofType("conceptos:search_nombre"),
        withLatestFrom(emisor$),
        map(([search, { rfc }]) => ({
          type: "concepto_nombre" as const,
          search: search as string,
          rfc,
        })),
        filter(({ rfc }) => validRFC(rfc))
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
      form$.pipe(pluck("rfc")),
      this.formEmitter.pipe(ofType("rfc:search")),
      this.formEmitter.pipe(ofType("rfc:set"), map(normalizeRFC))
    );

    const tipoPersona$ = receptorRFC$.pipe(
      distinctUntilChanged(),
      map(getTipoPersona)
    );

    //DIRECCION
    const direcciones$ = receptorRFC$.pipe(
      switchMap((rfc) =>
        this.fetchDirecciones(rfc).pipe(
          tap((direcciones) => {
            // auto select direccion
            if (!this.vm.form?.direccion?._id && direcciones?.length === 1) {
              this.formEmitter.next(["direccion:select", direcciones[0]]);
            }
            // reset direccion
            else if (
              this.vm.form?.direccion?._id &&
              direcciones != void 0 &&
              !direcciones.find(
                (direccion) => direccion._id === this.vm.form?.direccion?._id
              )
            ) {
              // this.formEmitter.next(['direccion:select', {}]);
            }

            // update selected if different
            let fromDirecciones;
            if (
              this.vm.form?.direccion?._id &&
              (fromDirecciones = direcciones?.find(
                (direccion) => direccion._id === this.vm.form?.direccion?._id
              )) &&
              !object_compare(this.vm.form?.direccion, fromDirecciones)
            ) {
              // this.formEmitter.next(['direccion:select', fromDirecciones]);
            }
          }),
          repeatWhen(() => this.formEmitter.pipe(ofType("direcciones:reload")))
        )
      ),
      share()
    );

    const direccion$ = merge(
      form$.pipe(pluck("direccion")),
      this.formEmitter.pipe(
        ofType("direccion:select"),
        map((direccion: object) => (this.vm.form.direccion = clone(direccion)))
      )
    );

    const estados$ = merge(
      direccion$.pipe(pluck("pais"), distinctUntilChanged()),
      this.formEmitter.pipe(
        ofType("pais:select"),
        tap(() => {
          this.vm.form.direccion.estado = "";
          this.vm.form.direccion.municipio = "";
          this.vm.municipios = [];
          this.vm.form.direccion.cp = "";
          this.vm.form.direccion.colonia = "";
          this.vm.colonias = [];
        })
      )
    ).pipe(switchMap(this.fetchEstados));

    const municipios$ = merge(
      direccion$.pipe(pluck("estado"), distinctUntilChanged()),
      this.formEmitter.pipe(
        ofType("estado:select"),
        tap(() => {
          this.vm.form.direccion.municipio = "";
          this.vm.form.direccion.cp = "";
          this.vm.form.direccion.colonia = "";
          this.vm.colonias = [];
        })
      )
    ).pipe(switchMap(this.fetchMunicipios));

    const colonias$ = merge(
      direccion$.pipe(pluck("cp"), distinctUntilChanged()),
      this.formEmitter.pipe(
        ofType("cp:input"),
        tap(() => {
          this.vm.form.direccion.colonia = "";
        })
      )
    ).pipe(switchMap(this.fetchColonias));

    //EMISOR
    const lugaresExpedicion$ = emisor$.pipe(
      pluck("rfc"),
      switchMap((rfc) =>
        this.fetchLugaresExpedicion(rfc).pipe(
          repeatWhen(() =>
            this.formEmitter.pipe(ofType("lugaresExpedicion:reload"))
          )
        )
      ),
      tap((lugaresExpedicion) => {
        if (
          !this.vm.form?.lugar_de_expedicion?._id &&
          lugaresExpedicion?.length === 1
        ) {
          this.vm.form.lugar_de_expedicion = lugaresExpedicion[0];
        }
        // reset lugar_de_expedicion
        else if (
          this.vm.form?.lugar_de_expedicion?._id &&
          lugaresExpedicion != void 0 &&
          !lugaresExpedicion.find(
            (direccion) =>
              direccion._id === this.vm.form?.lugar_de_expedicion?._id
          )
        ) {
          this.vm.form.lugar_de_expedicion = {};
        }
      })
    );

    const tipo_de_comprobante$ = combineLatest(
      catalogos$.pipe(take(1)),
      merge(
        form$.pipe(pluck("tipo_de_comprobante"), filter(Boolean)),
        this.formEmitter.pipe(ofType("tipo_de_comprobante:select"))
      )
    ).pipe(
      map(([catalogos, tipo_de_comprobante]: any) =>
        catalogos.tipos_de_comprobante.find(
          ({ clave }) => clave === tipo_de_comprobante
        )
      )
    );

    //CONCEPTOS
    const impuesto$ = of(null).pipe(
      observeOn(asapScheduler),
      switchMap((impuesto) =>
        this.formEmitter.pipe(
          ofType("impuestos:add"),
          startWith(1),
          map(() => (state) => clone(impuesto)),
          scan((state, f) => f(state), {})
        )
      )
    );

    const concepto$ = emisor$.pipe(
      map(({ rfc }) => ({
        rfc,
        impuestos: [],
      })),
      switchMap((concepto) =>
        merge(
          this.formEmitter.pipe(
            ofType("conceptos:add"),
            startWith(1),
            map(() => () => clone(concepto))
          ),
          this.formEmitter.pipe(
            ofType("conceptos:edit"),
            observeOn(animationFrameScheduler),
            pluck("1"),
            map((concepto) => () => concepto),
            tap(() => {
              window.document
                .getElementsByTagName("mat-sidenav-content")?.[0]
                ?.scrollTo({
                  top:
                    window.document.getElementById("conceptos").offsetTop -
                    (70 + 16),
                  behavior: "smooth",
                });
            })
          ),
          this.formEmitter.pipe(
            ofType("concepto:set"),
            map((concepto) => () => clone(concepto))
          ),
          this.formEmitter.pipe(
            ofType("impuestos:add"),
            map((impuesto) => (state) => ({
              ...state,
              impuestos: [...state.impuestos, clone(impuesto)],
            }))
          ),
          this.formEmitter.pipe(
            ofType("impuestos:remove"),
            map((index) => (state) => ({
              ...state,
              impuestos: state.impuestos.filter((_, i) => i !== index),
            }))
          )
        ).pipe(scan((state, f) => f(state), {}))
      )
    );

    const conceptos$ = form$.pipe(
      pluck("conceptos"),
      switchMap((conceptos) =>
        merge(
          of(1).pipe(map(() => (state) => clone(conceptos))),
          this.formEmitter.pipe(
            // required for reset controls
            observeOn(asapScheduler),
            ofType("conceptos:add"),
            map((concepto) => (state) => [...state, clone(concepto)]),
            tap(() => {
              // reset concepto controls
              this.resetConceptoControls();
            })
          ),
          merge(
            this.formEmitter.pipe(ofType("conceptos:remove")),
            this.formEmitter.pipe(ofType("conceptos:edit"), pluck("0"))
          ).pipe(map((index) => (state) => state.filter((_, i) => i !== index)))
        ).pipe(
          scan((state, f) => f(state), []),
          tap((conceptos) => (this.vm.form.conceptos = conceptos))
        )
      )
    );

    //DOCUMENTOS
    const uuid$ = of("");

    //FORM SUBMIT
    const formMode$ = this.formEmitter.pipe(ofType("submit"), pluck("1"));
    const isCartaporte$ = this.formEmitter.pipe(
      ofType("submit"),
      map((submit) => submit[3] === "cartaporte")
    );

    const {
      loading$: formLoading$,
      error$: formError$,
      success$: formSuccess$,
    } = makeRequestStream({
      fetch$: this.formEmitter.pipe(ofType("submit")),
      fetch: this.submitFactura,
      afterSuccess: (data) => {
        if (this.vm.isCartaporte) {
          this.router.navigate([
            routes.CARTA_PORTE,
            {
              id: data._id,
              redirectTo: this.resolveUrl([
                routes.EDIT_FACTURA,
                { id: data._id },
              ]),
            },
          ]);
        }
      },
      afterSuccessDelay: (data) => {
        if (!this.vm.isCartaporte) {
          this.router.navigate([routes.FACTURAS]);
        }
      },
      afterError: () => {
        window.document
          .getElementsByTagName("mat-sidenav-content")?.[0]
          ?.scrollTo({
            top: 9999999,
            behavior: "smooth",
          });
      },
    });

    this.vm = this.$rx.connect({
      form: form$,
      emisor: emisor$,
      readonly: readonly$,
      catalogos: catalogos$,
      helpTooltips: helpTooltips$,
      lugaresExpedicion: lugaresExpedicion$,
      series: series$,
      paises: paises$,
      facturaStatus: facturaStatus$,
      searchAction: searchAction$,
      receptorSearch: receptorSearch$,
      tipoPersona: tipoPersona$,
      searchLoading: searchLoading$,
      direcciones: direcciones$,
      direccion: direccion$,
      estados: estados$,
      municipios: municipios$,
      colonias: colonias$,
      tipo_de_comprobante: tipo_de_comprobante$,
      impuesto: impuesto$,
      concepto: concepto$,
      conceptos: conceptos$,
      uuid: uuid$,
      formMode: formMode$,
      isCartaporte: isCartaporte$,
      formLoading: formLoading$,
      formError: formError$,
      formSuccess: formSuccess$,
    });
  }

  createForm() {
    return of({
      rfc: "",
      nombre: "",
      usoCFDI: "",
      direccion: {},
      emisor: {
        rfc: "",
        nombre: "",
        regimen_fiscal: "",
      },
      lugar_de_expedicion: {},
      tipo_de_comprobante: "",
      moneda: "MXN",
      metodo_de_pago: "",
      forma_de_pago: "",
      condiciones_de_pago: "Contado",
      info_extra: "",
      conceptos: [],
      tipo_de_relacion: "",
      documentos_relacionados: [],
      serie: "",
    });
  }

  // API calls
  fetchForm(_id) {
    if (this.model === "template") {
      return from(
        this.apiRestService.apiRest(
          JSON.stringify({
            draft_id: _id,
          }),
          "invoice/get_draft",
          { loader: "false" }
        )
      ).pipe(
        mergeAll(),
        map((responseData) => fromFactura(responseData?.result))
      );
    }

    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          _id,
        }),
        "invoice",
        { loader: "false" }
      )
    ).pipe(
      mergeAll(),
      map((responseData) => fromFactura(responseData?.result?.invoices?.[0]))
    );
  }

  fetchCatalogosSAT() {
    // h7xma29J$
    // AUZM911206E49
    return from(
      this.apiRestService.apiRestGet("invoice/catalogs/invoice")
    ).pipe(mergeAll(), pluck("result"));
  }

  fetchHelpTooltips() {
    return oof(helpTooltips);
  }

  fetchFacturaStatus = () => {
    return from(
      this.apiRestService.apiRestGet("invoice/catalogs/statuses", {
        loader: "false",
      })
    ).pipe(mergeAll(), pluck("result"));
  };

  fetchDefaultEmisor = () => {
    return from(this.apiRestService.apiRest("", "invoice/config")).pipe(
      mergeAll(),
      pluck("result", "emisor")
    );
  };

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

  fetchSeries = (rfc: string) => {
    return rfc == void 0 || rfc === "" || !validRFC(rfc)
      ? of([])
      : from(
          this.apiRestService.apiRest(
            JSON.stringify({
              rfc,
            }),
            "invoice/series",
            { loader: "false" }
          )
        ).pipe(mergeAll(), pluck("result"), startWith(null));
  };

  fetchPaises() {
    return from(
      this.apiRestService.apiRestGet("invoice/catalogs/countries", {
        loader: "false",
      })
    ).pipe(mergeAll(), pluck("result"), startWith(null));
  }

  fetchEstados = (pais?: string) => {
    return pais == void 0 || pais === ""
      ? of([])
      : from(
          this.apiRestService.apiRest(
            JSON.stringify({ pais }),
            "invoice/catalogs/states",
            { loader: "false" }
          )
        ).pipe(mergeAll(), pluck("result"), startWith(null));
  };

  fetchMunicipios = (estado?: string) => {
    return estado == void 0 || estado === ""
      ? of([])
      : from(
          this.apiRestService.apiRest(
            JSON.stringify({ estado }),
            "invoice/catalogs/municipalities",
            { loader: "false" }
          )
        ).pipe(mergeAll(), pluck("result"), startWith(null));
  };

  fetchColonias = (cp?: string) => {
    return cp == void 0 || cp.trim() === "" || cp.length < 5
      ? of([])
      : from(
          this.apiRestService.apiRest(
            JSON.stringify({ cp }),
            "invoice/catalogs/suburbs",
            { loader: "false" }
          )
        ).pipe(mergeAll(), pluck("result"), startWith(null));
  };

  searchReceptor(search) {
    const endpoints = {
      rfc: "invoice/receivers",
      nombre: "invoice/receivers/by-name",
      rfcEmisor: "invoice/emitters",
      nombreEmisor: "invoice/emitters",
      concepto_nombre: "invoice/concepts",
      cve_sat: "invoice/catalogs/productos-y-servicios",
    };
    const keys = {
      rfc: "rfc",
      nombre: "name",
      rfcEmisor: "rfc",
      nombreEmisor: "nombre",
      concepto_nombre: "term",
      cve_sat: "term",
    };

    return from(
      this.apiRestService.apiRest(
        JSON.stringify({
          [keys[search.type]]: search.search,
          limit: 10,
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

    if (this.model === "template") {
      const draft_id = factura._id;
      const data =
        mode === "create"
          ? toFactura(factura)
          : (delete factura._id, { draft_id, new_fields: toFactura(factura) });

      return from(
        this.apiRestService.apiRest(
          JSON.stringify(data),
          `invoice/${mode}_draft`,
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
    }

    return from(
      this.apiRestService.apiRest(
        JSON.stringify(omitEmpty(toFactura(factura))),
        `invoice/${mode}?mode=${saveMode}`,
        {
          loader: "false",
        }
      )
    ).pipe(mergeAll());
  };

  // MODALS
  manageDirecciones(data) {
    const dialogRef = this.matDialog.open(FacturaManageDireccionesComponent, {
      data,
      restoreFocus: false,
      autoFocus: false,
      panelClass: ["dialog-solid"],
      disableClose: true,
    });
    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe(([config, res]) => {
      if (res) {
        this.formEmitter.next([
          config.model === "receptor"
            ? "direcciones:reload"
            : "lugaresExpedicion:reload",
          "",
        ]);
      }
    });
  }

  emisorConceptos(data) {
    this.matDialog.open(FacturaEmisorConceptosComponent, {
      data,
      restoreFocus: false,
      autoFocus: false,
      panelClass: ["dialog-solid"],
      disableClose: true,
    });
  }

  sendEmailFactura(_id: string) {
    this.matDialog.open(ActionSendEmailFacturaComponent, {
      data: {
        _id,
        to: [],
        reply_to: "",
      },
      restoreFocus: false,
      panelClass: ["dialog-solid"],
    });
  }

  cancelarFactura(_id: string) {
    this.matDialog.open(ActionCancelarFacturaComponent, {
      data: {
        _id,
        afterSuccessDelay: () => {
          window.document
            .getElementsByTagName("mat-sidenav-content")?.[0]
            ?.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          this.router.navigate([routes.EDIT_FACTURA, { id: _id, status: 4 }]);
          this.formEmitter.next(["refresh", ""]);
        },
      },
      restoreFocus: false,
      panelClass: ["dialog-solid"],
    });
  }

  deleteFactura(_id: string) {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: "Warning",
        modalMessage: `Are you sure you want to delete this factura with ID: ${_id}?
      This action can't be undone.`,
        modalPayload: {
          body: {
            _id,
          },
          endpoint: "invoice/delete",
          successMessage: "Factura deleted!",
          errorMessage: "Error deleting factura",
          // TODO: remove action?
          action: "emitBegoUser",
        },
      },
      restoreFocus: false,
      panelClass: ["dialog-solid"],
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((res?) => {
      if (res) {
        this.router.navigate([routes.FACTURAS]);
      }
    });
  }

  deleteTemplate(_id: string) {
    const dialogRef = this.matDialog.open(ActionConfirmationComponent, {
      data: {
        modalTitle: "Warning",
        modalMessage: `Are you sure you want to delete this template with ID: ${_id}?
      This action can't be undone.`,
        modalPayload: {
          body: {
            draft_id: _id,
          },
          endpoint: "invoice/delete_draft",
          successMessage: "Template deleted!",
          errorMessage: "Error deleting template",
          // TODO: remove action?
          action: "emitBegoUser",
        },
      },
      restoreFocus: false,
      panelClass: ["dialog-solid"],
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((res?) => {
      if (res) {
        this.router.navigate([routes.FACTURAS]);
      }
    });
  }

  createEditSerie(data) {
    // const dialogRef = this.matDialog.open(SeriesNewComponent, {
    //   autoFocus: false,
    //   panelClass: ["dialog-solid"],
    //   data,
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result == null || result.success == null || result.message === "")
    //     return;
    //   // this.notificationsService[
    //   //   result.success ? "showSuccessToastr" : "showErrorToastr"
    //   // ](result.message);
    // });
  }

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

  p = facturaPermissions;

  Boolean = Boolean;

  JSON = window.JSON;

  resolveUrl = (commands: any[]) => {
    return this.router.serializeUrl(this.router.createUrlTree(commands));
  };

  findById = (_id: string) => (item) => item._id === _id;

  v = validators;

  facturaStatus = facturaStatus;

  downloadPreview = (factura?) => {
    if (factura == void 0) return;

    window
      .fetch(this.URL_BASE + "invoice/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Acceontrol-Allow-Headers": "Content-Type, Accept",
          "Access-Css-Control-Allow-Methods": "POST,GET,OPTIONS",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(previewFactura(factura)),
      })
      .then((responseData) => responseData.arrayBuffer())
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/pdf",
        });

        const linkSource = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.target = "_blank";
        // downloadLink.download = 'Vista previa.pdf'
        downloadLink.click();
        setTimeout(() => URL.revokeObjectURL(linkSource), 5000);
      })
      .catch(() => {
        // this.notificationsService.showErrorToastr(
        //   "Error al generar vista previa"
        // );
      });
  };
}
