export const checkIfPercent = (parameter) => {
  if (!parameter) return false;

  const unit = parameter?.unit?.en || parameter.parameter.unit.en;
  const short_unit = parameter?.short_unit?.en || parameter.parameter.short_unit.en;

  if (!unit && !short_unit) return false;

  return unit.includes("%") || short_unit.includes("%");
};
