export interface ICommodity {
  _id?: string; // database (only present when invoice is created)
  id?: string; // local (required when invoice is not beign created)
  line?: number;
  bienes_transp: string;
  tipo_materia?: string;
  descripcion: string;
  cantidad: number;
  clave_unidad: string;
  peso_en_kg: number;
  material_peligroso: string | boolean;
  cantidad_transporta?: CantidadTransporta[];
  pedimento?: any[];
  guias_identificacion?: any[];
  fraccion_arancelaria?: string;
  cve_material_peligroso?: string;
  embalaje?: string;
  valor_mercancia?: number;
  moneda?: string;
  dimensiones?: string;
}

export interface CantidadTransporta {
  cantidad: number;
  id_origen: string;
  id_destino: string;
  cves_transporte?: string;
}
