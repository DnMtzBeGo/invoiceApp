export interface SerieAttributesInterface {
  _id: string;
  emisor: string;
  serie: string;
  tipo_comprobante: string;
  tipo_comprobante_desc: string;
  folio: string;
  color: string;
  logo: string;
}

export const serieAttributes: SerieAttributesInterface = {
  _id: "",
  emisor: "",
  serie: "",
  tipo_comprobante: "",
  tipo_comprobante_desc: "",
  folio: "",
  color: "",
  logo: "",
};
