import { numberFormatToString } from "../numberFormat";
import { decimalPrecision } from "../../consts";
import numeral from "numeral";

export const CalcPercents = {
  toPercents: (parameterValue) => {
    if (parameterValue === '' || parameterValue === null) return null;

    let parsed = parameterValue;
    if (typeof parameterValue === 'string') {
      if (parameterValue === ".")
      return parameterValue
      // Заменяем запятую на точку, если это строка
      parsed = parseFloat(parameterValue.replace(",", "."));
    }

    // Делим на 100 с помощью numeral
    const calculated = numeral(parsed).divide(100).value();

    return calculated;
  },

  toValue: (parameterValue) => {
    if (parameterValue === null) return null;

    let parsed = parameterValue;

    if (typeof parameterValue === 'string') {
      // Заменяем запятую на точку, если это строка
      parsed = parseFloat(parameterValue.replace(",", "."));
    }

    // Умножаем на 100 с помощью numeral
    const calculated = numeral(parsed).multiply(100).value();

    return calculated;
  },
};
