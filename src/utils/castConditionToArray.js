export const castConditionToArray = (conditions) => {
  return conditions
    ? Object.entries(conditions).map(([condition, formula]) => ({
        condition: condition,
        formula: formula,
      }))
    : conditions;
};
