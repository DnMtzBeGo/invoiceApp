enum RegimenAduaneroImpoExpo {
  Entrada = 'Entrada',
  Salida = 'Salida',
  SalidaEntrada = 'Salida,Entrada',
}

export interface RegimenAduanero {
  clave: string;
  descripcion: string;
  impo_expo: RegimenAduaneroImpoExpo;
}
