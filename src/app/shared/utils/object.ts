import { normalize } from "./string";

export const searchInObject = (search: string) => (object: object) =>
  Object.entries(object)
    .filter(
      ([_, value]) => typeof value === "string" || typeof value === "number"
    )
    .some(([_, value]) =>
      normalize(String(value).toLowerCase()).includes(search)
    );

export const isObject = (object) =>
  object != null && typeof object === "object" && object.constructor === Object;

export const clone = (object) => JSON.parse(JSON.stringify(object));

export const addObjectKeys = (object1, object2) => {
  const uniqueKeys = [
    ...new Set([...Object.keys(object1), ...Object.keys(object2)]),
  ];

  return Object.fromEntries(
    uniqueKeys.map((key) => [key, (object1[key] ?? 0) + (object2[key] ?? 0)])
  );
};

export const arrayToObject = (key, keyValue) => (array) =>
  Object.fromEntries(array.map((item) => [item[key], item[keyValue]]));

export const object_compare = (a, b) => JSON.stringify(a) === JSON.stringify(b);
