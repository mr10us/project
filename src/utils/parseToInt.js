export default function parseToInt(stringNumbers) {
  if (Array.isArray(stringNumbers)) {
    const numArray = stringNumbers.map((stringNumber) => {
      const replacedComma =
        typeof stringNumber == "string"
          ? stringNumber.replace(",", ".")
          : stringNumber;

      const number = parseFloat(replacedComma);

      return isNaN(number) ? 0 : number;
    });
    return numArray;
  } else {
    return null;
  }
}
