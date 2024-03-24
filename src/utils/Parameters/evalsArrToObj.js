export const evalsArrToObj = (evalsArr) => {
  const resultObject = evalsArr.reduce((acc, current) => {
    const key = Object.keys(current)[0];
    acc[key] = current[key];
    return acc;
  }, {});

  return resultObject;
};
