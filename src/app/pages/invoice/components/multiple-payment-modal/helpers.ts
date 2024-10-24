export const _importe = (importe: string | number): number => {
  if (typeof importe === 'number') importe = importe.toString();

  const parts = importe.split('.');

  if (parts?.[1]) {
    parts[1] = parts[1].substring(0, 6);
    return +parts.join('.');
  }

  return +importe;
};

export const _importeMXN = (importe: string | number): number => {
  if (typeof importe === 'number') importe = importe.toString();

  const parts = importe.split('.');

  if (parts?.[1]) {
    parts[1] = parts[1].substring(0, 2);
    return +parts.join('.');
  }

  return +importe;
};
