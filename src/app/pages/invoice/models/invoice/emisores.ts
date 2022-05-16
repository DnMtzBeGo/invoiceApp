export interface EmitterAttributesInterface {
  _id: string;
  parent: string;
  rfc: string;
  nombre: string;
  regimen_fiscal: string;
  email: string;
  archivo_cer: File;
  archivo_key: File;
  archivo_key_pswd: string;
  puede_timbrar: boolean;
}

export const emitterAttributes: EmitterAttributesInterface = {
  _id: "",
  parent: "",
  rfc: "",
  nombre: "",
  regimen_fiscal: "",
  email: "",
  archivo_cer: null,
  archivo_key: null,
  archivo_key_pswd: "",
  puede_timbrar: false,
};
