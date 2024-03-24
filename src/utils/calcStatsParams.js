import {
  calculateAverage,
  calculateMedian,
  calculateStandardDeviation,
  calculateCoefficientOfVariation,
} from "./calcStatistics";
import { numberFormatToString } from "./numberFormat";

export const calcStatsParams = (paramsToDisplay, measurementParams) => {
  if (measurementParams === undefined) return {};
  const parameters = {};

  measurementParams.forEach((paramList) =>
    paramList.forEach((paramData) => {
      const paramID = paramData.parameter.id;
      if (paramsToDisplay.includes(paramID)) {
        if (!parameters[paramID]) {
          parameters[paramID] = [];
        }
        parameters[paramID].push(paramData.number || 0);
      }
    })
  );

  const statsParams = Object.entries(parameters).map(([parameterID, list]) => {
    const average = list ? numberFormatToString(calculateAverage(list)) : "0";

    const median = list ? numberFormatToString(calculateMedian(list)) : "0";

    const stdv =
      list.length > 1
        ? numberFormatToString(calculateStandardDeviation(list))
        : "0";

    const cv =
      list.length > 1
        ? numberFormatToString(calculateCoefficientOfVariation(list))
        : "0";
    return {
      id: parameterID,
      average: average,
      median: median,
      stdv: stdv,
      cv: cv,
    };
  });

  return statsParams;
};
