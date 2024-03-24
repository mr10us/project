import { VALID_VARIABLE_NAME_CHARS, OPERATIONS_CHARS, decimalPrecision } from "../consts";

export function calculate(params, formula) {
  try {
    params.forEach((param) => {
      const value = param.static_value || param.measured_value || param.calculated_value || 0;
      if (isNaN(Number(value))) {
        return "Invalid value";
      }
      formula = formula.replace(
        new RegExp(`\\b${param.parameter.variable_name}\\b`, "g"),
        `(${value})`
      );
    });
    const result = eval(formula);

    if (isNaN(result)) return 0;

    return result.toFixed(decimalPrecision);
  } catch (error) {
    // console.error(error);
    return "Can not calculate";
  }
}

export function defineVariables(formula) {
  let currentVariable = "";
  const variables = new Set();
  const formulaArray = formula.split("");

  formulaArray.forEach((char) => {
    if (VALID_VARIABLE_NAME_CHARS.includes(char)) currentVariable += char;
    else {
      if (!OPERATIONS_CHARS.includes(char)) return "Not valid formula";

      if (currentVariable) {
        variables.add(currentVariable);
        currentVariable = "";
      }
    }
  });
  if (currentVariable) {
    variables.add(currentVariable);
  }
  return [...variables];
}

export function getParamsToCalculate(variables, params) {
  const paramsToCalculate = params.filter((param) =>
    variables.includes(param.parameter.variable_name)
  );
  return paramsToCalculate;
}
