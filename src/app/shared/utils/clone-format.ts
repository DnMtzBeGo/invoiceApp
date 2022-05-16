export const cloneObject: Function = (data) => {
  const result = JSON.parse(JSON.stringify(data));
  return result;
};
