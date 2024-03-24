import { VALID_VARIABLE_NAME_CHARS } from "../../consts";
import { numberFormatToString, numberFormatToNumber } from "../numberFormat";

function getRelationSet(condition, formula) {
  let varName = "";
  let result = new Set();

  // Number can`t be the first symbol
  for (let char of condition + " " + formula)
    if (VALID_VARIABLE_NAME_CHARS.includes(char)) varName += char;
    else {
      if (varName) result.add(varName);
      varName = "";
    }

  result.delete("default");

  if (varName) result.add(varName);

  return result;
}

function getNumber(value) {
  if (value) {
    if (value.static_value !== null)
      if (typeof value.static_value === "string")
        return numberFormatToNumber(value.static_value);
      else return value.static_value;
    if (value.measured_value !== null)
      if (typeof value.measured_value === "string")
        return numberFormatToNumber(value.measured_value);
      else return value.measured_value;
    if (value.calculated_value !== null)
      if (typeof value.calculated_value === "string")
        return numberFormatToNumber(value.calculated_value);
      else return value.calculated_value;
  }
  return null;
}

function getVarNumbers(valueByVar, relationSet) {
  let result = {};

  if (relationSet)
    for (let varName of relationSet)
      result[varName] = getNumber(valueByVar[varName]);
  else
    for (let [varName, value] of Object.entries(valueByVar))
      result[varName] = getNumber(value);

  return result;
}

function calc(expr, varNumbers) {
  let seq = Object.entries(varNumbers).toSorted(
    (a, b) => b[0].length - a[0].length
  );

  for (let [varName, number] of seq) expr = expr.replace(varName, number);

  return eval(expr);
}

export function validate_parameters(inputValues) {
  const values = JSON.parse(JSON.stringify(inputValues));

  const notCalculated = new Set();
  const valueByVar = {};
  const percents = [];

  // Preparation of convenient data structures
  for (let value of values) {
    const varName = value.parameter.variable_name;
    valueByVar[varName] = value;
    if (value.parameter.unit["en"] === "%")
      percents.push(value.parameter.variable_name);

    if (value.formulas !== null) notCalculated.add(varName);
  }

  let isResized = true;

  // Calculation
  for (let i in Array(10).fill()) {
    if (!notCalculated.size) break;

    const copy = [...notCalculated];

    for (let varName of copy) {
      const value = valueByVar[varName];
      const formulas = value.formulas;
      const len = Object.keys(formulas).length;

      for (let [condition, formula] of Object.entries(formulas)) {
        if (condition == "default" && len > 1 && isResized) continue;

        const relationSet = getRelationSet(condition, formula);
        const varNumbers = getVarNumbers(valueByVar, relationSet);

        if (Object.values(varNumbers).includes(null)) continue;

        let canCalculate, calculatedValue;

        if (condition == "default") canCalculate = true;
        else
          try {
            canCalculate = calc(condition, varNumbers);
          } catch {
            continue;
          }

        if (canCalculate) {
          value.hadPercents = false;

          for (let variable of percents)
            if (variable in varNumbers) {
              value.hadPercents = true;

              if (!percents.includes(varName)) {
                varNumbers[variable] = varNumbers[variable] / 100;
              } else {
                break;
              }
            }

          try {
            calculatedValue = calc(formula, varNumbers);
          } catch {
            continue;
          }

          const formattedNumber = numberFormatToString(calculatedValue);

          value.calculated_value = formattedNumber;
          notCalculated.delete(varName);
          break;
        }
      }
    }

    isResized = copy.length != notCalculated.size;
  }

  const varNumbers = getVarNumbers(valueByVar);

  // Evaluations field calculations
  for (let value of Object.values(valueByVar))
    if (value.evaluations) {
      let isFind = false;

      for (let [level, range] of Object.entries(value.evaluations)) {
        let min, max;

        try {
          min = calc(range.min.formula, varNumbers);
          max = calc(range.max.formula, varNumbers);
        } catch {
          continue;
        }

        const number = getNumber(value);

        if (number !== null)
          if (
            (min < number && number < max) ||
            (range.min.include && number == min) ||
            (range.max.include && number == max)
          ) {
            value.evaluations.computed = level;
            isFind = true;
            break;
          }
      }
      if (!isFind) value.evaluations.computed = null;
    }

  return values;
}
