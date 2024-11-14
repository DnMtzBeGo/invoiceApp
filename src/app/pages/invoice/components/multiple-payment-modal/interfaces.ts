import { TaxFactor, TaxType } from './enums';
import { MultiplePaymentModalComponent } from './multiple-payment-modal.component';

export interface IMultiplePaymentModalFlags {
  optionalPaymentDataFlag: boolean;
}

export interface IBillVersion {
  version: string;
}

export interface IBillSerie {
  serie: string;
}

export interface ISearch {
  date_start?: string;
  date_end?: string;
  series?: string;
  folio?: string;
  uuid?: string;
  version?: string;
}

export interface ITax {
  cve_sat: string;
  tipo_factor: string;
  es_retencion: boolean;
  tasa_cuota: number;
}

export interface ICFDITax {
  Base: number;
  Impuesto: string;
  TipoFactor: TaxFactor;
  Importe: number;
  TasaOCuota: number;
}

export interface ICFDITaxes {
  traslados?: ICFDITax | ICFDITax[];
  retenciones?: ICFDITax | ICFDITax[];
}

export interface IInvoicePayment {
  emisor: IDialogParamsEmisor;
  emisor_: string;
  receptor: IDialogParamsReceptor;
  receptor_: string;
  moneda: string;
  monto: number;
  np: number;
  folio: number;
  serie: string;
  serie_label: string;
  total: number;
  total_: string;
  _id: string;
  uuid: string;
  tipo_de_cambio: number;
  selection_check?: boolean;
  metodo_de_pago: string;
  monto_a_pagar?: number;
  saldo_pendiente?: number;
  objeto_imp: string | string[];
  impuestos: ICFDITaxes;
  tipo_de_comprobante: string;
  payments?: [IInvoiceChildPayment];
  status: number;
  actions?: {
    enabled: boolean;
    options: any;
  };
}

export interface IDialogParamsEmisor {
  _id: string;
  rfc: string;
  nombre: string;
  regimen_fiscal: string;
}

export interface IDialogParamsReceptor {
  rfc: string;
  nombre: string;
  regimen_fiscal: string;
  uso_cfdi: string;
  direccion?: string | IReceiverAddress;
}

export interface IPaymentComplementDialogParams {
  invoices: IInvoicePayment[];
}

export interface IPageChangeEvent {
  index: number;
  size: number;
  total: number;
}

export interface ISelecAtionParams {
  type: string;
  data: any;
}

export interface IAmounts {
  pending: number;
  payed: number;
  totalIVAWithholds: number;
  totalTransfersBase16: number;
  totalTransfersTax16: number;
}

export interface ITaxRegime {
  code: string;
  description: string;
  company: boolean;
  person: boolean;
}

export interface IGenericCatalog {
  code: string;
  description: string;
}

export interface ISerie {
  _id: string;
  emisor: string;
  serie: string;
  tipo_comprobante: string;
  folio: number;
  color?: string;
  logo?: ILogo;
}

export interface ILogo {
  ETag: string;
  Key: string;
  Bucket: string;
  Location: string;
}

export interface IExpeditionPlace {
  _id?: string;
  nombre: string;
  calle: string;
  numero: string;
  interior?: string;
  pais: string;
  estado: string;
  localidad?: string;
  municipio?: string;
  colonia?: string;
  cp: string;
  email?: string;
  //rfc: string;
  //user_id?: string;
}

export interface IReceiverAddress {
  _id: string;
  nombre: string;
  identificador: string;
  calle: string;
  numero: string;
  interior?: string;
  pais: string;
  estado: string;
  municipio?: string;
  cp: string;
  colonia?: string;
  email: string;
  localidad?: string;
  rfc: string;
}

export interface IMultiplePaymentCatalogs {
  formas_de_pago?: IGenericCatalog[];
  moneda?: IGenericCatalog[];
  regimen_fiscal?: ITaxRegime[];
}

export interface IEmitterCatalogs {
  expedition_places?: IExpeditionPlace[];
  series?: ISerie[];
}

export interface IReceiverCatalogs {
  addresses?: IReceiverAddress[];
}

export interface IInvoicePaymentConcept {
  clave_prod_serv: string;
  cantidad: number;
  clave_unidad: string;
  descripcion: string;
  valor_unitario: number;
  importe: number;
  objeto_imp: string;
}

export interface IWithHoldingsP {
  impuesto_p: TaxType;
  importe_p: number;
}

export interface ITransfersP {
  base_p: number;
  impuesto_p: TaxType;
  tipo_factor_p: TaxFactor;
  tasa_o_cuota_p: number;
  importe_p: number;
}

export interface ITaxesP {
  traslados_p?: ITransfersP;
  retenciones_p?: IWithHoldingsP;
}

export interface ITaxDR {
  base_dr: number;
  impuesto_dr: string;
  tipo_factor_dr: TaxFactor;
  tasa_o_cuota_dr: number;
  importe_dr: number;
}

export interface ITaxesDR {
  traslados_dr?: ITaxDR[];
  retenciones_dr?: ITaxDR[];
}

export interface IPaymentRelatedDocument {
  id_documento: string;
  impuestos_dr: ITaxesDR;
  serie: string;
  folio?: number;
  moneda_dr: string;
  equivalencia_dr?: number;
  num_parcialidad: number;
  imp_pagado: number;
  imp_saldo_insoluto: number;
  objeto_imp_dr: string;
}

export interface IPaymentV2 {
  version: string;
  fecha_pago: Date;
  hora: string;
  forma_de_pago_p: string;
  moneda_p: string;
  tipo_cambio_p: number;
  monto: number;
  num_operacion: string;

  rfc_emisor_cta_ord: string;
  nom_banco_ord_ext?: string;
  cta_ordenante: string;

  rfc_emisor_cta_ben: string;
  cta_beneficiario: string;
  // c_TipoCadenaPago
  tipo_cadena_de_pago: string;
  documentos_relacionados: IPaymentRelatedDocument[];
  impuestos_p: ITaxesP;
}

export interface IPaymentTotals {
  total_retenciones_iva?: number;
  total_retenciones_isr?: number;
  total_retenciones_ieps?: number;
  total_traslados_base_iva_16?: number;
  total_traslados_impuesto_iva_16?: number;
  monto_total_pagos?: number;
}
export interface IPaymentPayload {
  version: string;
  exportacion: string;
  tipo_de_comprobante: string;
  serie: string;
  lugar_de_expedicion: IExpeditionPlace;
  emisor: IDialogParamsEmisor;
  receptor: IDialogParamsReceptor;
  moneda: string;
  subtotal: number;
  conceptos: IInvoicePaymentConcept[];
  pago: IPaymentV2;
  totales: IPaymentTotals;
  status: number;
  uuid?: string;
  files?: object;
}

export interface IRelatedDocumentEdit {
  uuid: string;
  serie_label: string;
  folio: number;
  moneda: string;
  tipo_de_cambio: number;
  parcialidad: number;
  saldo_pendiente: number;
  monto_a_pagar: number;
}

export interface IInvoiceChildPayment {
  payment_id: string;
  amount: number;
  consecutive: number;
  outstanding_balance: number;
}
