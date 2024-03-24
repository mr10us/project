import dayjs from "dayjs";

export const parseQueryToObj = (query) => {
  if (query === "") return { is_active: "all", contain_measurements: "all" };
  const splitted = query.slice(1).split("&");

  const obj = {};

  splitted.forEach((param) => {
    let [key, value] = param.split("=");

    if (key === "created_at_after" || key === "created_at_before") {
      if (!obj.date_range || !obj.date_range instanceof Array)
        obj.date_range = [];
      
      const date = new Date(value)
      const d = dayjs(date)

      value === "created_at_after"
        ? obj.date_range.unshift(d)
        : obj.date_range.push(d);
    }

    if (value.includes("%2C")) value = value.split("%2C");
    if (value === "true") value = true;
    if (value === "false") value = false;

    obj[key] = value;
  });
  if (!obj?.is_active) obj.is_active = "all";

  return obj;
};
