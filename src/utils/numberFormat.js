export const numberFormatToString = (input) => {
  const formatedInput =
    typeof input == "string" ? input.replace(/[^\d.]/g, "") : input;
  const number = parseFloat(formatedInput);

  if (isNaN(number)) return null;

  const formated = new Intl.NumberFormat(navigator.language, {
    style: "decimal",
    useGrouping: true,
  }).format(number);

  return formated;
};

export const numberFormatToNumber = (input) => {
  const formatedInput =
    typeof input == "string" ? input.replace(/[^\d.]/g, "") : input;
  const number = parseFloat(formatedInput);

  return number;
};
