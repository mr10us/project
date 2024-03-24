export const parseObjToQuery = (filterValues) => {
  const parsed = Object.entries(filterValues).map(([key, value]) => {
    key = key.toLowerCase();

    if (
      key === "is_active" ||
      (key === "contain_measurements" && value === "all")
    )
      return;

    if (key === "date_range") return;

    if (value instanceof Array) value = value.join(",");
    if (typeof value === "boolean") value;
    else value = value.toLowerCase();

    return `${key}=${value}`;
  });

  const query = parsed.join("&");

  if (query[0] === "&") return query.slice(1);

  return query;
};
