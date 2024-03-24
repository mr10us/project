export const sortOrdinal = (parameters) => {
  const sortedParams = parameters.sort(
    (a, b) => a.ordinal_number - b.ordinal_number
  );
  const revalidatedOrdinalNumber = sortedParams.map((param, index) => ({
    ...param,
    ordinal_number: index + 1,
  }));
  return revalidatedOrdinalNumber;
};
