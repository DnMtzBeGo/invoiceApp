import { v4 as uuidv4 } from 'uuid';

import { addObjectKeys, prop } from '../../../../shared/utils/object';

const add = (x, y) => x + y;

const isaN = (n) => !isNaN(n);

export const validRFC = (rfc) => rfc != void 0 && rfc.length >= 12 && rfc.length <= 13;

const isRetencion = (impuesto) =>
  impuesto.retencion === true || impuesto.es_retencion === true || impuesto.es_retencion === 'true';

export const getImpuestoDescripcion = (impuesto) => {
  if (impuesto.descripcion) return impuesto.descripcion;

  const tipo = isRetencion(impuesto) ? 'Retención' : 'Traslado';
  let factor = impuesto.tipo_factor || impuesto.factor || '';
  factor = factor === 'Tasa' || factor === '' ? [] : [`(${factor})`];

  return [tipo, 'IVA'].concat(factor).join(' ');
};

export const calcImporte = (concepto) => {
  const cantidad = !isNaN(concepto.cantidad) ? Number(concepto.cantidad) : 0;
  const valor_unitario = !isNaN(concepto.valor_unitario) ? Number(concepto.valor_unitario) : 0;

  return cantidad * valor_unitario;
};

export const calcImpuesto = (subtotal) => (impuesto) => {
  const tasa_cuota = !isNaN(impuesto.tasa_cuota) ? Number(impuesto.tasa_cuota) : 0;

  return subtotal * tasa_cuota * (isRetencion(impuesto) ? -1 : 1);
};

export const calcConceptoSubtotal = (concepto) => {
  const importe = calcImporte(concepto);
  const descuento = !isNaN(concepto.descuento) ? Number(concepto.descuento) : 0;
  const subtotal = importe - descuento;

  return subtotal;
};

export const calcConcepto = (concepto) => {
  const subtotal = calcConceptoSubtotal(concepto);
  const impuestos = (concepto.impuestos || []).map(calcImpuesto(subtotal)).reduce(add, 0);
  const total = subtotal + impuestos;

  return total;
};

export const calcSubtotal = (conceptos) => (conceptos || []).map(calcImporte).reduce(add, 0);

export const calcDescuentos = (conceptos) =>
  (conceptos || [])
    .map((concepto) => concepto.descuento)
    .filter(isaN)
    .map(Number)
    .reduce(add, 0);

export const calcTotal = (conceptos) => (conceptos || []).map(calcConcepto).reduce(add, 0);

export const resolveImpuestoLabel = (impuestos, key, impuesto) => {
  const label =
    impuesto[key] ||
    (impuestos || []).find((impuesto_) => getImpuestoDescripcion(impuesto_) === getImpuestoDescripcion(impuesto))?.[
      key
    ] ||
    '';

  const tasa_cuota = !isNaN(impuesto.tasa_cuota) ? `${Number(impuesto.tasa_cuota * 100)}%` : '';

  return label.replace(':tasa_cuota', tasa_cuota);
};

export const resolveImpuesto = (concepto, impuesto) => {
  const subtotal = calcConceptoSubtotal(concepto);
  const calc = calcImpuesto(subtotal)(impuesto);

  return isNaN(impuesto.tasa_cuota)
    ? ''
    : isRetencion(impuesto)
    ? `($${Math.abs(calc).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })})`
    : `$${calc.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

export const resolveImpuestosGroup = (impuestos, key, conceptos) => {
  const allImpuestos = (conceptos || []).flatMap((concepto) =>
    (concepto.impuestos || [])
      .filter((impuesto) => resolveImpuestoLabel(impuestos, key, impuesto))
      .map((impuesto) => {
        const label = resolveImpuestoLabel(impuestos, key, impuesto);

        return [
          {
            [label]: Math.abs(calcImpuesto(calcConceptoSubtotal(concepto))(impuesto)),
          },
          { [label]: isRetencion(impuesto) },
        ];
      }),
  );

  const impuestosGroupImpositivo = allImpuestos
    .map((result) => result[1])
    .reduce((o1, o2) => Object.assign(o1, o2), {});

  const impuestosGroup = allImpuestos.map((result) => result[0]).reduce(addObjectKeys, {});

  return Object.entries(impuestosGroup).map(([label, impuesto]) => ({
    label,
    impuesto,
    retencion: impuestosGroupImpositivo[label],
  }));
};

// TODO agregar campos de extranjeros
export const fromFactura = (factura) => {
  const rfc = factura.receptor?.rfc?.toUpperCase() ?? '';
  const num_reg_id_trib = factura.receptor?.num_reg_id_trib ?? '';
  const residencia_fiscal = factura.receptor?.residencia_fiscal ?? '';
  const nombre = factura.receptor?.nombre;
  const usoCFDI = factura.receptor?.uso_cfdi;
  const regimen_fiscal = factura.receptor?.regimen_fiscal;
  const direccion = factura.receptor?.direccion ?? {};
  const emisor = factura.emisor ?? {};
  const lugar_de_expedicion = factura.lugar_de_expedicion ?? {};
  const conceptos = factura.conceptos ?? [];
  const documentos_relacionados = factura.documentos_relacionados ?? [];

  const newFactura = {
    rfc,
    nombre,
    usoCFDI,
    regimen_fiscal,
    num_reg_id_trib,
    residencia_fiscal,
    direccion,
    emisor,
    lugar_de_expedicion,
    conceptos,
    documentos_relacionados,
    ...factura,
  };

  delete newFactura.receptor;

  return newFactura;
};

// TODO agregar campos de extranjeros
export const toFactura = (factura: any) => {
  const receptor = {
    rfc: factura.rfc,
    nombre: factura.nombre,
    uso_cfdi: factura.usoCFDI,
    regimen_fiscal: factura.regimen_fiscal,
    direccion: { ...(factura.direccion || {}) },

    num_reg_id_trib: factura.num_reg_id_trib,
    residencia_fiscal: factura.residencia_fiscal,
  };

  if (factura.rfc !== 'XEXX010101000') {
    delete receptor.num_reg_id_trib;
    delete receptor.residencia_fiscal;

    const indexRS = requiredPathsFactura.findIndex((el) => el === 'residencia_fiscal');
    const indexNR = requiredPathsFactura.findIndex((el) => el === 'num_reg_id_trib');

    if (indexRS != -1) requiredPathsFactura.splice(indexRS, 1);
    if (indexNR != -1) requiredPathsFactura.splice(indexNR, 1);
  } else {
    requiredPathsFactura.push('num_reg_id_trib');
    requiredPathsFactura.push('residencia_fiscal');
  }

  const conceptos = (factura.conceptos || []).map((concepto) => ({
    ...concepto,
    impuestos: (concepto.impuestos || []).map((impuesto) => {
      return {
        ...impuesto,
        cve_sat: impuesto.clave ?? impuesto.cve_sat,
        es_retencion: impuesto.retencion ?? impuesto.es_retencion,
        tipo_factor: impuesto.factor ?? impuesto.tipo_factor,
      };
    }),
  }));

  const newFactura = {
    ...factura,
    receptor,
    conceptos,
    fecha_emision: new Date().toString(),
  };

  delete newFactura.rfc;
  delete newFactura.nombre;
  delete newFactura.usoCFDI;
  delete newFactura.regimen_fiscal;
  delete newFactura.direccion;
  delete newFactura.num_reg_id_trib;
  delete newFactura.residencia_fiscal;

  return newFactura;
};

export const fromFacturaCopy = (factura) => {
  const nonDuplicableProps = [
    '_id',
    'canceled',
    'status',
    'update_at',
    'uuid',
    'files',
    'folio',
    'error',
    'source',
    'stamped',
    'exportacion',
    'fecha_emision',
    'fecha_certificacion',
    'order',
    'notifications',
    'payments',
    'serie_text',
    'user_id',
  ];

  for (const key of nonDuplicableProps) delete factura?.[key];

  // avoid to use same id_ccp for duplicated invoice
  if (factura?.carta_porte && Object.keys(factura.carta_porte)) factura.carta_porte.id_ccp = generateIDCCP();

  factura.documentos_relacionados = [];

  return factura;
};

export const generateIDCCP = (): string => 'CCC' + uuidv4().substring(3, 36).toUpperCase();
export const generateUUID = (): string => uuidv4().toUpperCase();

export const facturaPermissions = (factura) => {
  const edit = !factura?.status || [1, 9].includes(factura.status);

  return {
    edit,
    readonly: !edit,
    vistaprevia: !factura?.status || [1, 9].includes(factura.status),
    pdf: factura?.status && [3, 4, 5].includes(factura.status),
    pdf_driver: factura?.status && [3, 4, 5].includes(factura.status),
    xml: factura?.status && [3, 4, 5].includes(factura.status),
    pdf_cancelado: factura?.status && [6, 7, 8].includes(factura.status),
    xml_acuse: factura?.status && [6, 7, 8].includes(factura.status),
    enviar_correo: factura?.status && [3, 4, 5].includes(factura.status),
    duplicar: factura?.status && [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(factura.status),
    cancelar: factura?.status && [3].includes(factura.status),
    eliminar: factura?.status && [1, 9].includes(factura.status),
    cartaporte: factura?.tipo_de_comprobante && ['I', 'T'].includes(factura.tipo_de_comprobante),
    showError: factura?.status && factura.status !== 3,
  };
};

export const makeReceptorTemplate = (user) => {
  return encodeURIComponent(
    JSON.stringify({
      receptor: {
        rfc: user?.rfc,
        nombre: user?.company,
        uso_cfdi: user?.cfdi,
      },
    }),
  );
};

export const makeEmisorTemplate = (user) => {
  return encodeURIComponent(
    JSON.stringify({
      emisor: {
        rfc: user?.rfc,
        nombre: user?.company,
      },
    }),
  );
};

export const previewFactura = (factura) => {
  return {
    ...factura,
    subtotal: calcSubtotal(factura.conceptos),
    total: calcTotal(factura.conceptos),
    conceptos: (factura.conceptos || []).map((concepto) => {
      const subtotal = calcConceptoSubtotal(concepto);
      return {
        ...concepto,
        importe: calcImporte(concepto),
        total: calcConcepto(concepto),
        impuestos: (concepto.impuestos || []).map((impuesto) => {
          return {
            ...impuesto,
            total: calcImpuesto(subtotal)(impuesto),
          };
        }),
      };
    }),
    fecha_emision: new Date().toISOString(),
  };
};

const empty = () => '';
export const validators = {
  valor_unitario: (control, value) => {
    const validations = [
      (v) => !Boolean(String(v ?? '')) && 'Campo numérico requerido',
      (v) => +v < 0 && 'Valor mínimo requerido de 0',
    ];

    return control.dirty || control.touched ? (validations.find((f) => f(value)) || empty)(value) : '';
  },
  cantidad: (control, value) => {
    const validations = [
      (v) => !Boolean(String(v ?? '')) && 'Campo numérico requerido',
      (v) => +v < 0 && 'Valor mínimo requerido de 0',
    ];

    return control.dirty || control.touched ? (validations.find((f) => f(value)) || empty)(value) : '';
  },
  descuento: (control, value, concepto?) => {
    const validations = [
      (v) => isNaN(v ?? undefined) && 'Campo numérico requerido',
      (v) => +v < 0 && 'Valor mínimo requerido de 0',
      (v) => +v > calcImporte(concepto) && 'El descuento no puede superar el importe',
    ];

    return (control.dirty || control.touched) && value != null
      ? (validations.find((f) => f(value)) || empty)(value)
      : '';
  },
};

export const facturaStatus = (key, status?) => {
  const defaults = {
    color: '#ededed',
  };

  const map = {
    [9]: { color: '#fa3c00' },
  };

  return map[status]?.[key] ?? defaults?.[key];
};

export const groupStatus = (list) => {
  const map = new Map();

  list.forEach((item) => {
    const group = item.nombre.split(' ').shift();
    map.set(group, (map.get(group) ?? []).concat(item));
  });

  return Array.from(map.values());
};

export const optimizeInvoiceCatalog = (catalog?) => {
  // if (catalog?.unidades_de_medida)
  //   return {
  //     ...catalog,
  //     unidades_de_medida: catalog.unidades_de_medida.filter(
  //       (item) => item.enabled === true
  //     ),
  //   };

  return catalog;
};

const requiredPathsFactura = [
  'receptor.rfc',
  'receptor.nombre',
  'receptor.uso_cfdi',
  'receptor.direccion.cp',
  'condiciones_de_pago',
  'emisor._id',
  'emisor.rfc',
  'emisor.nombre',
  'emisor.regimen_fiscal',
  'lugar_de_expedicion.cp',
  'tipo_de_comprobante',
  'metodo_de_pago',
  'forma_de_pago',
  'conceptos.0.nombre',
  'conceptos.0.cve_sat',
  'conceptos.0.unidad_de_medida',
  'conceptos.0.valor_unitario',
  'conceptos.0.cantidad',
  'conceptos.0.descripcion',
];

const requiredFieldF = (object) => (path) => ![void 0, ''].includes(prop(object, path.split('.')));

export const minimumRequiredFields = (factura) => {
  return requiredPathsFactura.every(requiredFieldF(factura));
};

export const searchInList = (
  component: any,
  listName: string | string[],
  filteredListName: string,
  code: string,
  propCode: string = 'code',
  propName: string = 'name',
): void => {
  component[filteredListName] = _searchInList(component, listName, code, propCode, propName);
};

const _searchInList = (
  component: any,
  listName: string | string[],
  code: string,
  propCode: string = 'code',
  propName: string = 'name',
): any[] => {
  let listContainer: any = null;
  if (Array.isArray(listName))
    for (const key of listName) {
      if (!listContainer) listContainer = component[key];
      else listContainer = listContainer[key];
    }
  else listContainer = component[listName];

  return code
    ? listContainer.filter(
        (m: any) =>
          m[propCode].toLowerCase().startsWith(code.toLowerCase()) ||
          _cleanLatinChars(m[propName]).toLowerCase().startsWith(code.toLowerCase()),
      )
    : [...listContainer];
};

export const _cleanLatinChars = (str: string): string => {
  const latinChars = ['á', 'é', 'í', 'ó', 'ú'];
  const replaceChars = ['a', 'e', 'i', 'o', 'u'];

  for (const i in latinChars) str = str.replace(new RegExp(latinChars[i], 'gi'), replaceChars[i]);

  return str;
};
