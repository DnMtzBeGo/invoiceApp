import { addObjectKeys } from "../../../../shared/utils/object";

const add = (x, y) => x + y;

const isaN = (n) => !isNaN(n);

export const validRFC = (rfc) =>
  rfc != void 0 && rfc.length >= 12 && rfc.length <= 13;

const isRetencion = (impuesto) =>
  impuesto.retencion === true ||
  impuesto.es_retencion === true ||
  impuesto.es_retencion === "true";

export const getImpuestoDescripcion = (impuesto) => {
  if (impuesto.descripcion) return impuesto.descripcion;

  const tipo = isRetencion(impuesto) ? "Retención" : "Traslado";
  let factor = impuesto.tipo_factor || impuesto.factor || "";
  factor = factor === "Tasa" || factor === "" ? [] : [`(${factor})`];

  return [tipo, "IVA"].concat(factor).join(" ");
};

export const calcImporte = (concepto) => {
  const cantidad = !isNaN(concepto.cantidad) ? Number(concepto.cantidad) : 0;
  const valor_unitario = !isNaN(concepto.valor_unitario)
    ? Number(concepto.valor_unitario)
    : 0;

  return cantidad * valor_unitario;
};

export const calcImpuesto = (subtotal) => (impuesto) => {
  const tasa_cuota = !isNaN(impuesto.tasa_cuota)
    ? Number(impuesto.tasa_cuota)
    : 0;

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
  const impuestos = (concepto.impuestos || [])
    .map(calcImpuesto(subtotal))
    .reduce(add, 0);
  const total = subtotal + impuestos;

  return total;
};

export const calcSubtotal = (conceptos) =>
  conceptos.map(calcImporte).reduce(add, 0);

export const calcDescuentos = (conceptos) =>
  conceptos
    .map((concepto) => concepto.descuento)
    .filter(isaN)
    .map(Number)
    .reduce(add, 0);

export const calcTotal = (conceptos) =>
  conceptos.map(calcConcepto).reduce(add, 0);

export const resolveImpuestoLabel = (impuestos, key, impuesto) => {
  const label =
    impuesto[key] ||
    (impuestos || []).find(
      (impuesto_) =>
        getImpuestoDescripcion(impuesto_) === getImpuestoDescripcion(impuesto)
    )?.[key] ||
    "";

  const tasa_cuota = !isNaN(impuesto.tasa_cuota)
    ? `${Number(impuesto.tasa_cuota * 100)}%`
    : "";

  return label.replace(":tasa_cuota", tasa_cuota);
};

export const resolveImpuesto = (concepto, impuesto) => {
  const subtotal = calcConceptoSubtotal(concepto);
  const calc = calcImpuesto(subtotal)(impuesto);

  return isNaN(impuesto.tasa_cuota)
    ? ""
    : isRetencion(impuesto)
    ? `($${Math.abs(calc).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })})`
    : `$${calc.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

export const resolveImpuestosGroup = (impuestos, key, conceptos) => {
  const allImpuestos = conceptos.flatMap((concepto) =>
    (concepto.impuestos || [])
      .filter((impuesto) => resolveImpuestoLabel(impuestos, key, impuesto))
      .map((impuesto) => {
        const label = resolveImpuestoLabel(impuestos, key, impuesto);

        return [
          {
            [label]: Math.abs(
              calcImpuesto(calcConceptoSubtotal(concepto))(impuesto)
            ),
          },
          { [label]: isRetencion(impuesto) },
        ];
      })
  );

  const impuestosGroupImpositivo = allImpuestos
    .map((result) => result[1])
    .reduce((o1, o2) => Object.assign(o1, o2), {});

  const impuestosGroup = allImpuestos
    .map((result) => result[0])
    .reduce(addObjectKeys, {});

  return Object.entries(impuestosGroup).map(([label, impuesto]) => ({
    label,
    impuesto,
    retencion: impuestosGroupImpositivo[label],
  }));
};

export const fromFactura = (factura) => {
  const rfc = factura.receptor?.rfc?.toUpperCase() ?? "";
  const nombre = factura.receptor?.nombre;
  const usoCFDI = factura.receptor?.uso_cfdi;
  const direccion = factura.receptor?.direccion ?? {};
  const emisor = factura.emisor ?? {};
  const lugar_de_expedicion = factura.lugar_de_expedicion ?? {};
  const conceptos = factura.conceptos ?? [];
  const documentos_relacionados = factura.documentos_relacionados ?? [];

  const newFactura = {
    rfc,
    nombre,
    usoCFDI,
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

export const toFactura = (factura: any) => {
  const receptor = {
    rfc: factura.rfc,
    nombre: factura.nombre,
    uso_cfdi: factura.usoCFDI,
    direccion: { ...(factura.direccion || {}) },
  };

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
  delete newFactura.direccion;

  return newFactura;
};

export const fromFacturaCopy = (factura) => {
  delete factura._id;
  delete factura.status;
  delete factura.updated_at;
  delete factura.canceled;
  delete factura.error;
  delete factura.source;
  delete factura.stamped;
  delete factura.exportacion;
  delete factura.fecha_emision;
  return factura;
};

export const facturaPermissions = (factura) => {
  const edit = !factura?.status || [1, 9].includes(factura.status);

  return {
    edit,
    readonly: !edit,
    vistaprevia: !factura?.status || [1, 9].includes(factura.status),
    pdf: factura?.status && [3, 4, 5].includes(factura.status),
    xml: factura?.status && [3, 4, 5].includes(factura.status),
    pdf_cancelado: factura?.status && [6, 7, 8].includes(factura.status),
    xml_acuse: factura?.status && [6, 7, 8].includes(factura.status),
    enviar_correo: factura?.status && [3, 4, 5].includes(factura.status),
    duplicar:
      factura?.status && [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(factura.status),
    cancelar: factura?.status && [3].includes(factura.status),
    eliminar: factura?.status && [1, 9].includes(factura.status),
    cartaporte:
      factura?.tipo_de_comprobante &&
      ["I", "T"].includes(factura.tipo_de_comprobante),
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
    })
  );
};

export const makeEmisorTemplate = (user) => {
  return encodeURIComponent(
    JSON.stringify({
      emisor: {
        rfc: user?.rfc,
        nombre: user?.company,
      },
    })
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

const empty = () => "";
export const validators = {
  valor_unitario: (control, value) => {
    const validations = [
      (v) => !Boolean(String(v ?? "")) && "Campo numérico requerido",
      (v) => +v < 0 && "Valor mínimo requerido de 0",
    ];

    return control.dirty || control.touched
      ? (validations.find((f) => f(value)) || empty)(value)
      : "";
  },
  cantidad: (control, value) => {
    const validations = [
      (v) => !Boolean(String(v ?? "")) && "Campo numérico requerido",
      (v) => +v < 0 && "Valor mínimo requerido de 0",
    ];

    return control.dirty || control.touched
      ? (validations.find((f) => f(value)) || empty)(value)
      : "";
  },
  descuento: (control, value, concepto?) => {
    const validations = [
      (v) => isNaN(v ?? undefined) && "Campo numérico requerido",
      (v) => +v < 0 && "Valor mínimo requerido de 0",
      (v) =>
        +v > calcImporte(concepto) &&
        "El descuento no puede superar el importe",
    ];

    return (control.dirty || control.touched) && value != null
      ? (validations.find((f) => f(value)) || empty)(value)
      : "";
  },
};

export const facturaStatus = (key, status?) => {
  const defaults = {
    color: "#ededed",
  };

  const map = {
    [9]: { color: "#ff4081" },
  };

  return map[status]?.[key] ?? defaults?.[key];
};

export const helpTooltips = {
  receptor: {
    rfc: `RFC\nIndica el Registro Federal del Contribuyente de tu cliente.`,
    nombre: `Nombre o Razón social\nExpresa el nombre, denominación o Razón Social de tu cliente.`,
    uso_cfdi: `Uso de CFDI\nSelecciona el uso que le dará tu cliente al CFDI.`,
    direccion: `Dirección\nPrecisa el domicilio fiscal del receptor, si tiene un sólo domicilio se expresa como "Principal". En caso de requerir agregar sucursales para el receptor, se identificarán con la información de "Nombre Dirección".`,
  },
  emisor: {
    rfc: `RFC\nIndica el Registro Federal del Contribuyente del emisor.`,
    nombre: `Nombre o Razón social\nExpresa el nombre, denominación o Razón Social del emisor.`,
    regimen_fiscal: `Régimen fiscal\nIncorpora la clave del régimen fiscal del contribuyente emisor al que aplicará el efecto fiscal de este comprobante.`,
  },
  lugar_de_expedicion: `Lugar de Expedición (Matriz o Sucursal)\nExpresa el C.P. del lugar en donde se emite el CFDI.`,
  tipo_de_comprobante: `Tipo de comprobante\nSelecciona el tipo de comprobante según sea la transacción comercial que se está realizando. Ingreso = Factura, Honorarios, Nota de Cargo, Donativos, Arrendamiento. Egreso = Nota de Crédito, Nota de devolución. Traslado = carta porte.`,
  moneda: `Moneda\nIdentifica la clave de la moneda utilizada para expresar los montos del CFDI, cuando se usa moneda nacional se registra MXN. Conforme con la especificación ISO 4217.`,
  metodo_de_pago: `Método de pago\nClave del método de pago que aplica para el CFDI, conforme al Artículo 29-A fracción VII incisos a y b del CFF.`,
  forma_de_pago: `Forma de pago\nExpresa la clave de la forma de pago de los bienes o servicios amparados por el CFDI.`,
  info_extra: `Información Extra\nExpresa información que se desea incluir en el PDF, puede incluirse información comercial o administrativa que ayude internamente.`,
  conceptos: `Conceptos\nEn éste apartado agregarás la información de los productos o servicios que se incluirán en el CFDI.`,
  concepto: {
    nombre: `Producto o Servicio\nNombre del producto o servicio a incluir en el CFDI`,
    cve_sat: `Descripción SAT\nIndica la descripción de tu producto, se desplegarán las posibles opciones del catálogo del SAT. Selecciona la opción que más se apegue a tu producto.`,
    unidad_de_medida: `Unidad de medida\nUnidad de medida del producto o servicio que se esta incluyendo en el CFDI.`,
    valor_unitario: `Precio unitario\nExpresa la cantidad monetaria que expresa el valor del producto o servicio antes de los impuestos. Sin comas, sólo indica después del punto los decimales. Ej. 1568.40`,
    cantidad: `Cantidad\nIndica el número de productos o servicios que se incluyen dentro del CFDI.`,
    descuento: `Descuento\nExpresa la cantidad monetaria a disminuir el precio unitario del producto o servicio que se incluye en el CFDI. Sin comas, sólo indica despues del punto los decimales. Ej. 1200.50`,
    descripcion: `Descripción\nIndica el detalle del producto o servicio que se está incluyendo en el CFDI.`,
    importe: `Importe\nExpresa el importe del producto o servicio. Resultado de la multiplicación de la cantidad por el precio unitario. Sin comas, sólo indica después del punto los decimales. Ej. 1568.40`,
    total: `Total concepto\nExpresa el valor neto del producto o servicio, incluyendo impuestos y/o descuento.`,
  },
  impuesto: {
    impuesto: `Impuesto\nExpresa el impuesto a incluir en el producto o servicio.`,
    tasa_cuota: `Tasa\nSelecciona el porcentaje de la tasa que corresponda al impuesto seleccionado. El porcentaje se  calcula con base al importe del producto o servicio. Ej. Si el importe es $100 y la tasa 16%,  el monto del impuesto será igual a $16.00. 8% sólo aplica para emisores autorizados por el SAT en zona fronteriza.`,
  },
  documentos_relacionados: `Documentos relacionados\nExpresa la información de los CFDI relacionados al comprobante que se está emitiendo.`,
  documentos_relacionado: {
    tipo_de_relacion: `Tipo de relación\nIndica la relación que existe entre el CFDI que se está generando y el/los CFDI previo(s).`,
    uuid: `UUID\nFolio fiscal del CFDI. Ejemplo: 1335D8A8-1D90-445C-A20D-3371CCDE6006`,
  },
  complementos: `Complementos\nInformación adicional regulada por el SAT, se incluye en el XML. Puede incluir información para un sector o actividad específica.`,
  serie:
    "Serie\nExpresa letra o conjunto de letras para tener un control interno de los CFDI.",
};
