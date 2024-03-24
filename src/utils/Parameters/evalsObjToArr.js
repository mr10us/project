export const evalsObjToArr = (evalsObj) => {
  const resultArr = Object.entries(evalsObj).map(([evalKey, values]) => ({
    [evalKey]: values,
  }));

  return resultArr;
};
