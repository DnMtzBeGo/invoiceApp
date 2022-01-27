export const consecutiveEquals = (items: any[]): number[] => {
  if (items.length === 0) return [];

  let prev = items[0];
  let counter = 1;
  let arr = [];

  for (let i = 1; i < items.length; ++i) {
    if (items[i] == prev) {
      counter += 1;
    } else {
      arr.push(counter);
      counter = 1;
      prev = items[i];
    }
  }

  arr.push(counter);

  return arr;
};
