import { alertLevels } from "../../consts";

export const fillEvals = (evaluations) => {
  const filledEvaluations = {};

  for (let level in alertLevels)
    if (evaluations === null || !evaluations[level])

      filledEvaluations[level] = {
        min: { formula: "", include: false },
        max: { formula: "", include: false },
      };
    else filledEvaluations[level] = evaluations[level];

  return filledEvaluations;
};
