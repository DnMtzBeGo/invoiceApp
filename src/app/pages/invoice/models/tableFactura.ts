export interface TableFactura {
  _id: string;
  tipo_de_comprobante: string;
  condiciones_de_pago: string;
  forma_de_pago: string;
  serie: string;
  moneda: string;
  metodo_de_pago: string;
  receptor: {
    rfc: string;
    nombre: string;
  };
  conceptos?: unknown[];
}
