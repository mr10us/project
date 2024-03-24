export const formatEvals = (evals) => {
  if (!evals) return {};
  const evaluations = {};
  Object.entries(evals).forEach(([evaluation, values]) => {
    if (evaluation === "computed") 
      return;

    if (values.min.formula !== "" && values.max.formula !== "")

      evaluations[evaluation] = values;
  })

  return evaluations;
};
