import { normalize } from "./string";

export const searchInObject = (search: string) => (object: object) =>
  Object.entries(object)
    .filter(
      ([_, value]) => typeof value === "string" || typeof value === "number"
    )
    .some(([_, value]) =>
      normalize(String(value).toLowerCase()).includes(search)
    );

export const isObject = (object: object) =>
  object != null && typeof object === "object" && object.constructor === Object;

export const clone = (object: object) => JSON.parse(JSON.stringify(object));

export const addObjectKeys = (object1: any, object2: any) => {
  const uniqueKeys = [
    ...new Set([...Object.keys(object1), ...Object.keys(object2)]),
  ];

  return Object.fromEntries(
    uniqueKeys.map((key) => [key, (object1[key] ?? 0) + (object2[key] ?? 0)])
  );
};

export const arrayToObject = (key: string, keyValue: string) => (array: []) =>
  Object.fromEntries(array.map((item: any) => [item[key], item[keyValue]]));

export const object_compare = (a: object, b: object) =>
  JSON.stringify(a) === JSON.stringify(b);
