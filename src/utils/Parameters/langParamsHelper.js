export function extractLangFromKey(values, keyField, splitter = "_") {
  return Object.entries(values)
    .map(([key, value]) => {
      const paramName = key.split(splitter)[0];
      if (paramName === keyField) {
        const langKey = key.split(splitter)[1];
        return { [langKey]: value || "" };
      }
    })
    .filter(Boolean);
}
export function formatToValidObj(array) {
  return array.reduce((acc, obj) => {
    const key = Object.keys(obj)[0];
    const value = obj[key];
    if (!value) return acc;

    acc = { ...acc, [key]: value };
    return acc;
  }, {});
}

export function formatToTabsOutput(obj, keyField) {
  return Object.entries(obj).reduce((acc, entry) => {
    const [key, value] = entry;
    acc[`${keyField}_${key}`] = value;
    return acc;
  }, {});
}

export function getParameterName(parameter, currentLang = "en") {
  const parameterName = parameter.name[currentLang] || parameter.name.en;
  const parameterShortUnit =
    parameter.short_unit[currentLang] || parameter.short_unit.en;
  const parameterVariableName = parameter.variable_name;

  const validName =
    parameterName + ", " + parameterShortUnit + ` (${parameterVariableName})`;
  return validName;
}
