import { normalize } from "./string";

const searchTypes = new Set(["string", "number"]);
export const searchInObject = (search: string) => (object: object) => {
  for (const prop in object) {
    const value = object[prop];

    if (
      searchTypes.has(typeof value) &&
      value !== "" &&
      normalize(String(value).toLowerCase()).includes(search)
    )
      return true;
  }

  return false;
};

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

export const prop = (obj, props) => {
  if (obj == void 0) return void 0;

  props = props.reverse();
  for (let i = props.length - 1; i >= 0; --i) {
    if (obj[props[i]] == void 0) return void 0;
    obj = obj[props[i]];
  }

  return obj;
};
