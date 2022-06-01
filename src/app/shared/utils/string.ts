export const normalize = (str: string) =>
  str
    .normalize("NFD")
    .replace(/([aeio])\u0301|(u)[\u0301\u0308]/gi, "$1$2")
    .normalize();
