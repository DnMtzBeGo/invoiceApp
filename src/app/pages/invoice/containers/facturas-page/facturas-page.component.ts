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
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { routes } from "../../consts";
import { Paginator } from "../../models";
import { FacturaFiltersComponent } from "../../modals";
import { reactiveComponent } from "src/app/shared/utils/decorators";
import { ofType, oof } from "src/app/shared/utils/operators.rx";
import {
  arrayToObject,
  object_compare,
  clone,
} from "src/app/shared/utils/object";
import { AuthService } from "src/app/shared/services/auth.service";

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
    private matDialog: MatDialog,
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

    return oof({
      invoices: [
        {
          _id: "6244b3dde2c55f523480d9ad",
          fecha_emision: "2022-03-30T13:47:41.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 1000,
          descuento: 0,
          serie: "62449b08b963715e7e8487db",
          moneda: "MXN",
          total: 1160,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Periférico Boulevard Manuel Ávila Camacho",
            numero: 3130,
            colonia: "San Lucas Tepetlacalco",
            cp: "54020",
            pais: "MEX",
            estado: "Estado de México",
            _id: "6244b3dde2c55f523480d9ae",
          },
          emisor: {
            _id: "623e4bebbf1b12b77ab298a0",
            rfc: "FUNK671228PH6",
            nombre: "KARLA  FUENTE NOLASCO",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "Federico",
            uso_cfdi: "G01",
            direccion: {
              identificador: "order_default",
              calle: "Periférico Boulevard Manuel Ávila Camacho",
              numero: 3130,
              pais: "MEX",
              estado: "Estado de México",
              colonia: "San Lucas Tepetlacalco",
              cp: "54020",
              _id: "6244b3dde2c55f523480d9b0",
            },
            _id: "6244b3dde2c55f523480d9af",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 1000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "6244b3dde2c55f523480d9b2",
                },
              ],
              _id: "6244b3dde2c55f523480d9b1",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 160,
            _id: "6244b3dde2c55f523480d9b3",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T19:47:41.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "6244b3dde2c55f523480d9b6",
                },
                _id: "6244b3dde2c55f523480d9b5",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T19:47:41.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Guillermo",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "6244b3dde2c55f523480d9b8",
                },
                _id: "6244b3dde2c55f523480d9b7",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10191506",
                  descripcion: "asd",
                  cantidad: 1,
                  clave_unidad: "26",
                  peso_en_kg: 1000,
                  material_peligroso: "Sí",
                  cve_material_peligroso: "2786",
                  embalaje: "6HA1",
                  _id: "6244b3dde2c55f523480d9ba",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF16",
                num_permiso_sct: "1112341133",
                identificacion_vehicular: {
                  config_vehicular: "C3",
                  placa_v_m: "Sax212",
                  anio_modelo_v_m: 2022,
                  _id: "6244b3dde2c55f523480d9bc",
                },
                seguros: {
                  asegura_resp_civil: "Security",
                  poliza_resp_civil: "123456",
                  asegura_med_ambiente: "Security",
                  poliza_ambiente: "2230031947",
                  _id: "6244b3dde2c55f523480d9bd",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "Caha",
                  _id: "6244b3dde2c55f523480d9be",
                },
                _id: "6244b3dde2c55f523480d9bb",
              },
              _id: "6244b3dde2c55f523480d9b9",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "XAXX010101000",
                nombre_figura: "marco mx",
                num_licencia: "000000000000000000000000000000000",
                _id: "6244b3dde2c55f523480d9bf",
                partes_transporte: [],
              },
            ],
            _id: "6244b3dde2c55f523480d9b4",
          },
          order: "6244a7c97b6bf6d95caab6a6",
          status: 9,
          canceled: false,
          error: [
            {
              code: 500,
              message:
                "\n Element CartaPorte/Remolque, attribute Placa: [facet pattern] The value Caha is not accepted by the pattern [^(?!.*\\\\s)-]5,7.\n Element CartaPorte/Remolque, attribute Placa: Caha is not a valid value of the local atomic type.\n Element CartaPorte/TiposFigura, attribute NumLicencia: [facet maxLength] The value 000000000000000000000000000000000 has a length of 33; this exceeds the allowed maximum length of 16.\n Element CartaPorte/TiposFigura, attribute NumLicencia: [facet pattern] The value 000000000000000000000000000000000 is not accepted by the pattern [^|]6,16.\n Element CartaPorte/TiposFigura, attribute NumLicencia: 000000000000000000000000000000000 is not a valid value of the local atomic type.",
            },
          ],
          source: "orders",
          created_at: "1970-01-20T01:57:49",
          documentos_relacionados: [],
          serie_label: "ABCDE",
        },
        {
          _id: "6244b28de2c55f523480d911",
          fecha_emision: "2022-03-30T13:42:05.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 5000,
          descuento: 0,
          serie: "624351b0a5408dd6c1337a67",
          moneda: "MXN",
          total: 5800,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Calle Porfirio Díaz",
            numero: 1424,
            colonia: "Salvarcar",
            cp: "32573",
            pais: "MEX",
            estado: "Chihuahua",
            _id: "6244b28de2c55f523480d912",
          },
          emisor: {
            _id: "6241eee2b822c8e62ffb358c",
            rfc: "CACX7605101P8",
            nombre: "XOCHILT CASAS CHAVEZ",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "JUSLS SA",
            uso_cfdi: "I03",
            direccion: {
              identificador: "order_default",
              calle: "Calle Porfirio Díaz",
              numero: 1424,
              pais: "MEX",
              estado: "Chihuahua",
              colonia: "Salvarcar",
              cp: "32573",
              _id: "6244b28de2c55f523480d914",
            },
            _id: "6244b28de2c55f523480d913",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 5000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "6244b28de2c55f523480d916",
                },
              ],
              _id: "6244b28de2c55f523480d915",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 800,
            _id: "6244b28de2c55f523480d917",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T19:42:05.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "6244b28de2c55f523480d91a",
                },
                _id: "6244b28de2c55f523480d919",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T19:42:05.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Juan",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "6244b28de2c55f523480d91c",
                },
                _id: "6244b28de2c55f523480d91b",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10122101",
                  descripcion: "Fragile",
                  cantidad: 1,
                  clave_unidad: "46",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "6244b28de2c55f523480d91e",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF17",
                num_permiso_sct: "6543211",
                identificacion_vehicular: {
                  config_vehicular: "T2S1",
                  placa_v_m: "1234561",
                  anio_modelo_v_m: 2014,
                  _id: "6244b28de2c55f523480d920",
                },
                seguros: {
                  asegura_resp_civil: "Aseguradora X",
                  poliza_resp_civil: "123456",
                  _id: "6244b28de2c55f523480d921",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "798794",
                  _id: "6244b28de2c55f523480d922",
                },
                _id: "6244b28de2c55f523480d91f",
              },
              _id: "6244b28de2c55f523480d91d",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "CACX7605101P8",
                nombre_figura: "memo rodriguez",
                num_licencia: "LIC1231",
                _id: "6244b28de2c55f523480d923",
                partes_transporte: [],
              },
            ],
            _id: "6244b28de2c55f523480d918",
          },
          order: "624351b0a5408dd6c1337a68",
          status: 3,
          canceled: false,
          error: [],
          source: "orders",
          created_at: "1970-01-20T01:57:49",
          documentos_relacionados: [],
          stamped: true,
          uuid: "E4F3AF01-BE94-4139-AB8C-6B8674A2A02E",
          files: {
            xml: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_194212_cfdi.xml",
            pdf: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_194212_cfdi.xml.pdf",
          },
          serie_label: "OP2",
        },
        {
          _id: "6244b0ade2c55f523480d8aa",
          fecha_emision: "2022-03-30T13:34:05.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 2000,
          descuento: 0,
          serie: "6244928ab963715e7e8482e5",
          moneda: "MXN",
          total: 2320,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Periférico Boulevard Manuel Ávila Camacho",
            numero: 3130,
            colonia: "San Lucas Tepetlacalco",
            cp: "54020",
            pais: "MEX",
            estado: "Estado de México",
            _id: "6244b0ade2c55f523480d8ab",
          },
          emisor: {
            _id: "623e4bebbf1b12b77ab298a0",
            rfc: "FUNK671228PH6",
            nombre: "KARLA  FUENTE NOLASCO",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "Federico",
            uso_cfdi: "G01",
            direccion: {
              identificador: "order_default",
              calle: "Periférico Boulevard Manuel Ávila Camacho",
              numero: 3130,
              pais: "MEX",
              estado: "Estado de México",
              colonia: "San Lucas Tepetlacalco",
              cp: "54020",
              _id: "6244b0ade2c55f523480d8ad",
            },
            _id: "6244b0ade2c55f523480d8ac",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 2000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "6244b0ade2c55f523480d8af",
                },
              ],
              _id: "6244b0ade2c55f523480d8ae",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 320,
            _id: "6244b0ade2c55f523480d8b0",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T19:34:04.000Z",
                rfc_remitente_destinatario: "XAX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "6244b0ade2c55f523480d8b3",
                },
                _id: "6244b0ade2c55f523480d8b2",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T19:34:04.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Guillermo ",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "6244b0ade2c55f523480d8b5",
                },
                _id: "6244b0ade2c55f523480d8b4",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10121503",
                  descripcion: "Asd",
                  cantidad: 1,
                  clave_unidad: "48",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "6244b0ade2c55f523480d8b7",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF16",
                num_permiso_sct: "1112341133",
                identificacion_vehicular: {
                  config_vehicular: "C3",
                  placa_v_m: "Sax212",
                  anio_modelo_v_m: 2022,
                  _id: "6244b0ade2c55f523480d8b9",
                },
                seguros: {
                  asegura_resp_civil: "Security",
                  poliza_resp_civil: "123456",
                  _id: "6244b0ade2c55f523480d8ba",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "Caha",
                  _id: "6244b0ade2c55f523480d8bb",
                },
                _id: "6244b0ade2c55f523480d8b8",
              },
              _id: "6244b0ade2c55f523480d8b6",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "XAXX010101000",
                nombre_figura: "marco mx",
                num_licencia: "000000000000000000000000000000000",
                _id: "6244b0ade2c55f523480d8bc",
                partes_transporte: [],
              },
            ],
            _id: "6244b0ade2c55f523480d8b1",
          },
          order: "624497e2b963715e7e8485e4",
          status: 9,
          canceled: false,
          error: [
            {
              code: 500,
              message:
                "\n Element CartaPorte/Remolque, attribute Placa: [facet pattern] The value Caha is not accepted by the pattern [^(?!.*\\\\s)-]5,7.\n Element CartaPorte/Remolque, attribute Placa: Caha is not a valid value of the local atomic type.\n Element CartaPorte/TiposFigura, attribute NumLicencia: [facet maxLength] The value 000000000000000000000000000000000 has a length of 33; this exceeds the allowed maximum length of 16.\n Element CartaPorte/TiposFigura, attribute NumLicencia: [facet pattern] The value 000000000000000000000000000000000 is not accepted by the pattern [^|]6,16.\n Element CartaPorte/TiposFigura, attribute NumLicencia: 000000000000000000000000000000000 is not a valid value of the local atomic type.",
            },
          ],
          source: "orders",
          created_at: "1970-01-20T01:57:48",
          documentos_relacionados: [],
          serie_label: "ABCD",
        },
        {
          _id: "624488bfb963715e7e847d64",
          fecha_emision: "2022-03-30T10:43:43.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 5000,
          descuento: 0,
          serie: "624351b0a5408dd6c1337a67",
          moneda: "MXN",
          total: 5800,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Calle Porfirio Díaz",
            numero: 1424,
            colonia: "Salvarcar",
            cp: "32573",
            pais: "MEX",
            estado: "Chihuahua",
            _id: "624488bfb963715e7e847d65",
          },
          emisor: {
            _id: "6241eee2b822c8e62ffb358c",
            rfc: "CACX7605101P8",
            nombre: "XOCHILT CASAS CHAVEZ",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "JUSLS SA",
            uso_cfdi: "I03",
            direccion: {
              identificador: "order_default",
              calle: "Calle Porfirio Díaz",
              numero: 1424,
              pais: "MEX",
              estado: "Chihuahua",
              colonia: "Salvarcar",
              cp: "32573",
              _id: "624488bfb963715e7e847d67",
            },
            _id: "624488bfb963715e7e847d66",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 5000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "624488bfb963715e7e847d69",
                },
              ],
              _id: "624488bfb963715e7e847d68",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 800,
            _id: "624488bfb963715e7e847d6a",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T16:43:43.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "624488bfb963715e7e847d6d",
                },
                _id: "624488bfb963715e7e847d6c",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T16:43:43.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Juan",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "624488bfb963715e7e847d6f",
                },
                _id: "624488bfb963715e7e847d6e",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10122101",
                  descripcion: "Fragile",
                  cantidad: 1,
                  clave_unidad: "46",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "624488bfb963715e7e847d71",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF17",
                num_permiso_sct: "654321",
                identificacion_vehicular: {
                  config_vehicular: "T3S3",
                  placa_v_m: "123456",
                  anio_modelo_v_m: 2014,
                  _id: "624488bfb963715e7e847d73",
                },
                seguros: {
                  asegura_resp_civil: "Aseguradora X",
                  poliza_resp_civil: "123456",
                  _id: "624488bfb963715e7e847d74",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "798794",
                  _id: "624488bfb963715e7e847d75",
                },
                _id: "624488bfb963715e7e847d72",
              },
              _id: "624488bfb963715e7e847d70",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "CACX7605101P8",
                nombre_figura: "memo rodriguez",
                num_licencia: "LIC1231",
                _id: "624488bfb963715e7e847d76",
                partes_transporte: [],
              },
            ],
            _id: "624488bfb963715e7e847d6b",
          },
          order: "624351b0a5408dd6c1337a68",
          status: 3,
          canceled: false,
          error: [],
          source: "orders",
          created_at: "1970-01-20T01:57:38",
          documentos_relacionados: [],
          stamped: true,
          uuid: "C43CF560-EDC6-463A-8350-9B5DF87EE977",
          files: {
            xml: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_164352_cfdi.xml",
            pdf: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_164352_cfdi.xml.pdf",
          },
          serie_label: "OP2",
        },
        {
          _id: "624485f732f2fe68c10f1c91",
          fecha_emision: "2022-03-30T10:31:51.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 5000,
          descuento: 0,
          serie: "624351b0a5408dd6c1337a67",
          moneda: "MXN",
          total: 5800,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Calle Porfirio Díaz",
            numero: 1424,
            colonia: "Salvarcar",
            cp: "32573",
            pais: "MEX",
            estado: "Chihuahua",
            _id: "624485f732f2fe68c10f1c92",
          },
          emisor: {
            _id: "6241eee2b822c8e62ffb358c",
            rfc: "CACX7605101P8",
            nombre: "XOCHILT CASAS CHAVEZ",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "JUSLS SA",
            uso_cfdi: "I03",
            direccion: {
              identificador: "order_default",
              calle: "Calle Porfirio Díaz",
              numero: 1424,
              pais: "MEX",
              estado: "Chihuahua",
              colonia: "Salvarcar",
              cp: "32573",
              _id: "624485f732f2fe68c10f1c94",
            },
            _id: "624485f732f2fe68c10f1c93",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 5000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "624485f732f2fe68c10f1c96",
                },
              ],
              _id: "624485f732f2fe68c10f1c95",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 800,
            _id: "624485f732f2fe68c10f1c97",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T16:31:51.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "624485f732f2fe68c10f1c9a",
                },
                _id: "624485f732f2fe68c10f1c99",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T16:31:51.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Juan",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "624485f732f2fe68c10f1c9c",
                },
                _id: "624485f732f2fe68c10f1c9b",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10122101",
                  descripcion: "Fragile",
                  cantidad: 1,
                  clave_unidad: "46",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "624485f732f2fe68c10f1c9e",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF17",
                num_permiso_sct: "654321",
                identificacion_vehicular: {
                  config_vehicular: "T3S3",
                  placa_v_m: "123456",
                  anio_modelo_v_m: 2014,
                  _id: "624485f732f2fe68c10f1ca0",
                },
                seguros: {
                  asegura_resp_civil: "Aseguradora X",
                  poliza_resp_civil: "123456",
                  _id: "624485f732f2fe68c10f1ca1",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "798794",
                  _id: "624485f732f2fe68c10f1ca2",
                },
                _id: "624485f732f2fe68c10f1c9f",
              },
              _id: "624485f732f2fe68c10f1c9d",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "CACX7605101P8",
                nombre_figura: "memo rodriguez",
                num_licencia: "LIC1231",
                _id: "624485f732f2fe68c10f1ca3",
                partes_transporte: [],
              },
            ],
            _id: "624485f732f2fe68c10f1c98",
          },
          order: "624351b0a5408dd6c1337a68",
          status: 3,
          canceled: false,
          error: [],
          source: "orders",
          created_at: "1970-01-20T01:57:37",
          documentos_relacionados: [],
          stamped: true,
          uuid: "230FF84F-1A6E-4E9D-A9CD-A6E22DE05970",
          files: {
            xml: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_163151_cfdi.xml",
            pdf: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_163151_cfdi.xml.pdf",
          },
          serie_label: "OP2",
        },
        {
          _id: "624485da32f2fe68c10f1c73",
          fecha_emision: "2022-03-30T10:31:22.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 5000,
          descuento: 0,
          serie: "624351b0a5408dd6c1337a67",
          moneda: "MXN",
          total: 5800,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Calle Porfirio Díaz",
            numero: 1424,
            colonia: "Salvarcar",
            cp: "32573",
            pais: "MEX",
            estado: "Chihuahua",
            _id: "624485da32f2fe68c10f1c74",
          },
          emisor: {
            _id: "6241eee2b822c8e62ffb358c",
            rfc: "CACX7605101P8",
            nombre: "XOCHILT CASAS CHAVEZ",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "JUSLS SA",
            uso_cfdi: "I03",
            direccion: {
              identificador: "order_default",
              calle: "Calle Porfirio Díaz",
              numero: 1424,
              pais: "MEX",
              estado: "Chihuahua",
              colonia: "Salvarcar",
              cp: "32573",
              _id: "624485da32f2fe68c10f1c76",
            },
            _id: "624485da32f2fe68c10f1c75",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 5000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "624485da32f2fe68c10f1c78",
                },
              ],
              _id: "624485da32f2fe68c10f1c77",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 800,
            _id: "624485da32f2fe68c10f1c79",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T16:31:22.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "624485da32f2fe68c10f1c7c",
                },
                _id: "624485da32f2fe68c10f1c7b",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T16:31:22.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Juan",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "624485da32f2fe68c10f1c7e",
                },
                _id: "624485da32f2fe68c10f1c7d",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10122101",
                  descripcion: "Fragile",
                  cantidad: 1,
                  clave_unidad: "46",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "624485da32f2fe68c10f1c80",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF17",
                num_permiso_sct: "654321",
                identificacion_vehicular: {
                  config_vehicular: "T3S3",
                  placa_v_m: "123456",
                  anio_modelo_v_m: 2014,
                  _id: "624485da32f2fe68c10f1c82",
                },
                seguros: {
                  asegura_resp_civil: "Aseguradora X",
                  poliza_resp_civil: "123456",
                  _id: "624485da32f2fe68c10f1c83",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "798794",
                  _id: "624485da32f2fe68c10f1c84",
                },
                _id: "624485da32f2fe68c10f1c81",
              },
              _id: "624485da32f2fe68c10f1c7f",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "CACX7605101P8",
                nombre_figura: "memo rodriguez",
                num_licencia: "LIC1231",
                _id: "624485da32f2fe68c10f1c85",
                partes_transporte: [],
              },
            ],
            _id: "624485da32f2fe68c10f1c7a",
          },
          order: "624351b0a5408dd6c1337a68",
          status: 3,
          canceled: false,
          error: [],
          source: "orders",
          created_at: "1970-01-20T01:57:37",
          documentos_relacionados: [],
          stamped: true,
          uuid: "F94DF6CA-4D7B-40ED-AA11-D0EF64BAE177",
          files: {
            xml: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_163131_cfdi.xml",
            pdf: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_163131_cfdi.xml.pdf",
          },
          serie_label: "OP2",
        },
        {
          _id: "6244858132f2fe68c10f1c3e",
          fecha_emision: "2022-03-30T10:29:53.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 5000,
          descuento: 0,
          serie: "624351b0a5408dd6c1337a67",
          moneda: "MXN",
          total: 5800,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Calle Porfirio Díaz",
            numero: 1424,
            colonia: "Salvarcar",
            cp: "32573",
            pais: "MEX",
            estado: "Chihuahua",
            _id: "6244858132f2fe68c10f1c3f",
          },
          emisor: {
            _id: "6241eee2b822c8e62ffb358c",
            rfc: "CACX7605101P8",
            nombre: "XOCHILT CASAS CHAVEZ",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "JUSLS SA",
            uso_cfdi: "I03",
            direccion: {
              identificador: "order_default",
              calle: "Calle Porfirio Díaz",
              numero: 1424,
              pais: "MEX",
              estado: "Chihuahua",
              colonia: "Salvarcar",
              cp: "32573",
              _id: "6244858132f2fe68c10f1c41",
            },
            _id: "6244858132f2fe68c10f1c40",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 5000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "6244858132f2fe68c10f1c43",
                },
              ],
              _id: "6244858132f2fe68c10f1c42",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 800,
            _id: "6244858132f2fe68c10f1c44",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T16:29:53.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "6244858132f2fe68c10f1c47",
                },
                _id: "6244858132f2fe68c10f1c46",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T16:29:53.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Juan",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "6244858132f2fe68c10f1c49",
                },
                _id: "6244858132f2fe68c10f1c48",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10122101",
                  descripcion: "Fragile",
                  cantidad: 1,
                  clave_unidad: "46",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "6244858132f2fe68c10f1c4b",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF17",
                num_permiso_sct: "654321",
                identificacion_vehicular: {
                  config_vehicular: "T3S3",
                  placa_v_m: "123456",
                  anio_modelo_v_m: 2014,
                  _id: "6244858132f2fe68c10f1c4d",
                },
                seguros: {
                  asegura_resp_civil: "Aseguradora X",
                  poliza_resp_civil: "123456",
                  _id: "6244858132f2fe68c10f1c4e",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "798794",
                  _id: "6244858132f2fe68c10f1c4f",
                },
                _id: "6244858132f2fe68c10f1c4c",
              },
              _id: "6244858132f2fe68c10f1c4a",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "CACX7605101P8",
                nombre_figura: "memo rodriguez",
                num_licencia: "LIC1231",
                _id: "6244858132f2fe68c10f1c50",
                partes_transporte: [],
              },
            ],
            _id: "6244858132f2fe68c10f1c45",
          },
          order: "624351b0a5408dd6c1337a68",
          status: 3,
          canceled: false,
          error: [],
          source: "orders",
          created_at: "1970-01-20T01:57:37",
          documentos_relacionados: [],
          stamped: true,
          uuid: "D9B7E852-9BB1-41ED-92D7-9509BB9F39CC",
          files: {
            xml: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_163001_cfdi.xml",
            pdf: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_163001_cfdi.xml.pdf",
          },
          serie_label: "OP2",
        },
        {
          _id: "624484a532f2fe68c10f1be1",
          fecha_emision: "2022-03-30T10:26:13.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 5000,
          descuento: 0,
          serie: "624351b0a5408dd6c1337a67",
          moneda: "MXN",
          total: 5800,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Calle Porfirio Díaz",
            numero: 1424,
            colonia: "Salvarcar",
            cp: "32573",
            pais: "MEX",
            estado: "Chihuahua",
            _id: "624484a532f2fe68c10f1be2",
          },
          emisor: {
            _id: "6241eee2b822c8e62ffb358c",
            rfc: "CACX7605101P8",
            nombre: "XOCHILT CASAS CHAVEZ",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "JUSLS SA",
            uso_cfdi: "I03",
            direccion: {
              identificador: "order_default",
              calle: "Calle Porfirio Díaz",
              numero: 1424,
              pais: "MEX",
              estado: "Chihuahua",
              colonia: "Salvarcar",
              cp: "32573",
              _id: "624484a532f2fe68c10f1be4",
            },
            _id: "624484a532f2fe68c10f1be3",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 5000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "624484a532f2fe68c10f1be6",
                },
              ],
              _id: "624484a532f2fe68c10f1be5",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 800,
            _id: "624484a532f2fe68c10f1be7",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T16:26:13.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "624484a532f2fe68c10f1bea",
                },
                _id: "624484a532f2fe68c10f1be9",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T16:26:13.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Juan",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "624484a532f2fe68c10f1bec",
                },
                _id: "624484a532f2fe68c10f1beb",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10122101",
                  descripcion: "Fragile",
                  cantidad: 1,
                  clave_unidad: "46",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "624484a532f2fe68c10f1bee",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF17",
                num_permiso_sct: "654321",
                identificacion_vehicular: {
                  config_vehicular: "T3S3",
                  placa_v_m: "123456",
                  anio_modelo_v_m: 2014,
                  _id: "624484a532f2fe68c10f1bf0",
                },
                seguros: {
                  asegura_resp_civil: "Aseguradora X",
                  poliza_resp_civil: "123456",
                  _id: "624484a532f2fe68c10f1bf1",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "798794",
                  _id: "624484a532f2fe68c10f1bf2",
                },
                _id: "624484a532f2fe68c10f1bef",
              },
              _id: "624484a532f2fe68c10f1bed",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "CACX7605101P8",
                nombre_figura: "memo rodriguez",
                num_licencia: "LIC1231",
                _id: "624484a532f2fe68c10f1bf3",
                partes_transporte: [],
              },
            ],
            _id: "624484a532f2fe68c10f1be8",
          },
          order: "624351b0a5408dd6c1337a68",
          status: 3,
          canceled: false,
          error: [],
          source: "orders",
          created_at: "1970-01-20T01:57:37",
          documentos_relacionados: [],
          stamped: true,
          uuid: "7012417E-9CCD-4B4D-B664-DFB004265A28",
          files: {
            xml: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_162621_cfdi.xml",
            pdf: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_162621_cfdi.xml.pdf",
          },
          serie_label: "OP2",
        },
        {
          _id: "6244847b32f2fe68c10f1bba",
          fecha_emision: "2022-03-30T10:25:31.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 5000,
          descuento: 0,
          serie: "624351b0a5408dd6c1337a67",
          moneda: "MXN",
          total: 5800,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Calle Porfirio Díaz",
            numero: 1424,
            colonia: "Salvarcar",
            cp: "32573",
            pais: "MEX",
            estado: "Chihuahua",
            _id: "6244847b32f2fe68c10f1bbb",
          },
          emisor: {
            _id: "6241eee2b822c8e62ffb358c",
            rfc: "CACX7605101P8",
            nombre: "XOCHILT CASAS CHAVEZ",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "JUSLS SA",
            uso_cfdi: "I03",
            direccion: {
              identificador: "order_default",
              calle: "Calle Porfirio Díaz",
              numero: 1424,
              pais: "MEX",
              estado: "Chihuahua",
              colonia: "Salvarcar",
              cp: "32573",
              _id: "6244847b32f2fe68c10f1bbd",
            },
            _id: "6244847b32f2fe68c10f1bbc",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 5000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "6244847b32f2fe68c10f1bbf",
                },
              ],
              _id: "6244847b32f2fe68c10f1bbe",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 800,
            _id: "6244847b32f2fe68c10f1bc0",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T16:25:31.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "6244847b32f2fe68c10f1bc3",
                },
                _id: "6244847b32f2fe68c10f1bc2",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T16:25:31.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Juan",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "6244847b32f2fe68c10f1bc5",
                },
                _id: "6244847b32f2fe68c10f1bc4",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10122101",
                  descripcion: "Fragile",
                  cantidad: 1,
                  clave_unidad: "46",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "6244847b32f2fe68c10f1bc7",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF17",
                num_permiso_sct: "654321",
                identificacion_vehicular: {
                  config_vehicular: "T3S3",
                  placa_v_m: "123456",
                  anio_modelo_v_m: 2014,
                  _id: "6244847b32f2fe68c10f1bc9",
                },
                seguros: {
                  asegura_resp_civil: "Aseguradora X",
                  poliza_resp_civil: "123456",
                  _id: "6244847b32f2fe68c10f1bca",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "798794",
                  _id: "6244847b32f2fe68c10f1bcb",
                },
                _id: "6244847b32f2fe68c10f1bc8",
              },
              _id: "6244847b32f2fe68c10f1bc6",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "CACX7605101P8",
                nombre_figura: "memo rodriguez",
                num_licencia: "LIC1231",
                _id: "6244847b32f2fe68c10f1bcc",
                partes_transporte: [],
              },
            ],
            _id: "6244847b32f2fe68c10f1bc1",
          },
          order: "624351b0a5408dd6c1337a68",
          status: 3,
          canceled: false,
          error: [],
          source: "orders",
          created_at: "1970-01-20T01:57:37",
          documentos_relacionados: [],
          stamped: true,
          uuid: "A7AA6FD8-BBFF-406B-82E8-5395132736F6",
          files: {
            xml: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_162541_cfdi.xml",
            pdf: "https://begoclients.s3.amazonaws.com/development/orders/13MAY3ML/invoices/2022/03/CACX7605101P8-CPI-20220330_162541_cfdi.xml.pdf",
          },
          serie_label: "OP2",
        },
        {
          _id: "6244844f32f2fe68c10f1b91",
          fecha_emision: "2022-03-30T10:24:47.000Z",
          condiciones_de_pago: "Contado",
          forma_de_pago: "03",
          subtotal: 5000,
          descuento: 0,
          serie: "624351b0a5408dd6c1337a67",
          moneda: "MXN",
          total: 5800,
          tipo_de_comprobante: "I",
          metodo_de_pago: "PUE",
          lugar_de_expedicion: {
            calle: "Calle Porfirio Díaz",
            numero: 1424,
            colonia: "Salvarcar",
            cp: "32573",
            pais: "MEX",
            estado: "Chihuahua",
            _id: "6244844f32f2fe68c10f1b92",
          },
          emisor: {
            _id: "6241eee2b822c8e62ffb358c",
            rfc: "CACX7605101P8",
            nombre: "XOCHILT CASAS CHAVEZ",
            regimen_fiscal: "612",
          },
          receptor: {
            rfc: "XAXX010101000",
            nombre: "JUSLS SA",
            uso_cfdi: "I03",
            direccion: {
              identificador: "order_default",
              calle: "Calle Porfirio Díaz",
              numero: 1424,
              pais: "MEX",
              estado: "Chihuahua",
              colonia: "Salvarcar",
              cp: "32573",
              _id: "6244844f32f2fe68c10f1b94",
            },
            _id: "6244844f32f2fe68c10f1b93",
          },
          conceptos: [
            {
              nombre: "Flete",
              cve_sat: "78101802",
              cantidad: 1,
              unidad_de_medida: "E48",
              valor_unitario: 5000,
              descripcion:
                "Transporte de carga por carretera (en camión) nivel nacional",
              impuestos: [
                {
                  cve_sat: "002",
                  tipo_factor: "Tasa",
                  es_retencion: false,
                  tasa_cuota: 0.16,
                  _id: "6244844f32f2fe68c10f1b96",
                },
              ],
              _id: "6244844f32f2fe68c10f1b95",
            },
          ],
          impuestos_totales: {
            total_impuestos_retenidos: 0,
            total_impuestos_trasladados: 800,
            _id: "6244844f32f2fe68c10f1b97",
          },
          carta_porte: {
            version: 2,
            transp_internac: "No",
            total_dist_rec: 1094.62,
            ubicaciones: [
              {
                tipo_ubicacion: "Origen",
                fecha_hora_salida_llegada: "2022-03-30T16:24:47.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Federico",
                id_ubicacion: "OR000006",
                domicilio: {
                  calle: "Mariano Matamoros",
                  numero_exterior: "N/F",
                  pais: "MEX",
                  estado: "TAM",
                  localidad: "06",
                  colonia: "",
                  codigo_postal: "88000",
                  _id: "6244844f32f2fe68c10f1b9a",
                },
                _id: "6244844f32f2fe68c10f1b99",
              },
              {
                tipo_ubicacion: "Destino",
                fecha_hora_salida_llegada: "2022-03-30T16:24:47.000Z",
                rfc_remitente_destinatario: "XAXX010101000",
                nombre_remitente_destinatario: "Juan",
                id_ubicacion: "DE000007",
                distancia_recorrida: 1094.62,
                domicilio: {
                  calle: "Periférico Boulevard Manuel Ávila Camacho",
                  numero_exterior: "3130",
                  pais: "MEX",
                  estado: "MEX",
                  localidad: "14",
                  colonia: "",
                  codigo_postal: "54020",
                  _id: "6244844f32f2fe68c10f1b9c",
                },
                _id: "6244844f32f2fe68c10f1b9b",
              },
            ],
            mercancias: {
              peso_bruto_total: 1000,
              unidad_peso: "KGM",
              num_total_mercancias: 1,
              mercancia: [
                {
                  bienes_transp: "10122101",
                  descripcion: "Fragile",
                  cantidad: 1,
                  clave_unidad: "46",
                  peso_en_kg: 1000,
                  material_peligroso: "No",
                  _id: "6244844f32f2fe68c10f1b9e",
                  cantidad_transporta: [],
                  pedimentos: [],
                  guias_identificacion: [],
                },
              ],
              autotransporte: {
                perm_sct: "TPAF17",
                num_permiso_sct: "654321",
                identificacion_vehicular: {
                  config_vehicular: "T3S3",
                  placa_v_m: "123456",
                  anio_modelo_v_m: 2014,
                  _id: "6244844f32f2fe68c10f1ba0",
                },
                seguros: {
                  asegura_resp_civil: "Aseguradora X",
                  poliza_resp_civil: "123456",
                  _id: "6244844f32f2fe68c10f1ba1",
                },
                remolques: {
                  sub_tipo_rem: "CTR007",
                  placa: "798794",
                  _id: "6244844f32f2fe68c10f1ba2",
                },
                _id: "6244844f32f2fe68c10f1b9f",
              },
              _id: "6244844f32f2fe68c10f1b9d",
            },
            figura_transporte: [
              {
                tipo_figura: "01",
                rfc_figura: "CACX7605101P8",
                nombre_figura: "memo rodriguez",
                num_licencia: "LIC1231",
                _id: "6244844f32f2fe68c10f1ba3",
                partes_transporte: [],
              },
            ],
            _id: "6244844f32f2fe68c10f1b98",
          },
          order: "624351b0a5408dd6c1337a68",
          status: 9,
          canceled: false,
          error: [
            {
              code: 500,
              message:
                "unable to load key file\n,140432268780864:error:0909006C:PEM routines:get_name:no start line:../crypto/pem/pem_lib.c:745:Expecting: ANY PRIVATE KEY\n",
            },
          ],
          source: "orders",
          created_at: "1970-01-20T01:57:37",
          documentos_relacionados: [],
          serie_label: "OP2",
        },
      ],
      pages: 6,
    });

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
    return oof([
      { enabled: true, clave: "I", descripcion: "Ingreso" },
      { enabled: false, clave: "E", descripcion: "Egreso" },
      { enabled: true, clave: "T", descripcion: "Traslado" },
      { enabled: false, clave: "N", descripcion: "Nómina" },
      { enabled: false, clave: "P", descripcion: "Pago" },
    ]);

    return from(
      this.apiRestService.apiRestGet("invoice/catalogs/tipos-de-comprobante", {
        loader: "false",
      })
    ).pipe(mergeAll(), pluck("result"));
  }

  fetchFacturaStatus = () => {
    return oof([
      {
        clave: 1,
        nombre: "Pendiente",
        descripcion: "Factura recien creada y pendiente de timbrar",
      },
      {
        clave: 2,
        nombre: "Pendiente (espera de generación)",
        descripcion: "Factura enviada a la cola de timbrado",
      },
      { clave: 3, nombre: "Emitido", descripcion: "Factura timbrada" },
      {
        clave: 4,
        nombre: "Emitido (En espera de cancelación)",
        descripcion: "Factura cancelada en espera del acuse de cancelación",
      },
      {
        clave: 5,
        nombre: "Emitido (Cancelación rechazada)",
        descripcion: "Factura con cancelación rechazada por el receptor",
      },
      {
        clave: 6,
        nombre: "Cancelado (Directo)",
        descripcion: "Factura cancelada sin necesidad de confirmación",
      },
      {
        clave: 7,
        nombre: "Cancelado (Aceptado)",
        descripcion: "Factura cancelada sin necesidad de confirmación",
      },
      {
        clave: 8,
        nombre: "Cancelado (Plazo vencido)",
        descripcion:
          "Factura cancelada sin respuesta por parte del receptor despues de 72 horas (cancelada por omisión).",
      },
      {
        clave: 9,
        nombre: "Pendiente (con errores)",
        descripcion: "Factura con errores de timbrado",
      },
    ]);

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

  // MODALS
  openFilters() {
    const dialogRef = this.matDialog.open(FacturaFiltersComponent, {
      data: {
        tiposComprobante: this.vm.tiposComprobante,
        facturaStatus: this.vm.facturaStatus,
        params: clone(this.vm.params),
      },
      restoreFocus: false,
      autoFocus: false,
      // panelClass: [""],
      // hasBackdrop: true,
      backdropClass: ["brand-dialog-filters"],
      position: {
        top: "13.5rem",
      },
    });

    // TODO: false/positive when close event
    dialogRef.afterClosed().subscribe((params) => {
      console.log("afterClosed", params);
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
}
