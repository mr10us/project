import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export const getDashboardDate = (rawDate, locale) => {
  dayjs.extend(utc);

  const inputDate = dayjs.utc(rawDate).locale(locale);
  const outputDateStr = inputDate.format("DD MMMM YYYY");

  return outputDateStr;
};

export const getDateDiapazone = (start, end, locale) => {
  const diapazone = `${dayjs(start).locale(locale).format("DD")} ${dayjs(start)
    .locale(locale)
    .format("MMMM")} – ${dayjs(end).locale(locale).format("DD")} ${dayjs(end)
    .locale(locale)
    .format("MMMM")}`;

  return diapazone;
};

export const getLocaleDate = (date, locale = "en") => {
  if (date === null)
    return new Date().toLocaleString(locale);

  const localeDate = new Date(date).toLocaleString(locale);

  return localeDate;
};
