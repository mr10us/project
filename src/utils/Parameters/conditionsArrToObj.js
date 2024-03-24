export const conditionsArrToObj = (conditionsArr) => {
  const keylessConditions = conditionsArr.map((item) => ({
    condition: item.condition,
    formula: item.formula,
  }));

  const resultObject = keylessConditions.reduce((acc, current) => {
    const [[_, conditionValue], [__, formulaValue]] = Object.entries(current);
    acc[conditionValue] = formulaValue;
    return acc;
  }, {});

  return resultObject;
};
