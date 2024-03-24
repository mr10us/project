export const defineEvalIndicator = (value, evaluations) => {
  for (let i = 0; i < evaluations.length; i++) {
    const range = evaluations[i];
    const minValue = parseFloat(range.min);
    const maxValue = parseFloat(range.max);
    const numericValue = parseFloat(value);

    const isInRange =
      (range.include_min
        ? numericValue >= minValue
        : numericValue > minValue) &&
      (range.include_max
        ? numericValue <= maxValue
        : numericValue < maxValue);

    if (isInRange) {
      return range.level;
    }
  }

  return null;
};