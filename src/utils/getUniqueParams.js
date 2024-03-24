export const getUniqueParams = (array) => {
  const uniqueParams = Array.from(
    new Set(array.map((obj) => obj.parameter.id))
  ).map((id) => array.find((obj) => obj.parameter.id === id));

  return uniqueParams;
};
