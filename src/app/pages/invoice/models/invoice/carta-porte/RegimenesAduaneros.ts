export enum TIPO_REGIMEN_ADUANERO {
  'Entrada',
  'Salida',
  'Salida,Entrada'
}

export interface RegimenesAduaneros {
  clave: string;
  descripcion: string;
  impo_expo: TIPO_REGIMEN_ADUANERO;
}
