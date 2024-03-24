import dayjs from "dayjs";

/**
 *
 * @param {String} ISO date
 * @returns ISO date at a beginning of a day
 */
export const startOfADay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
};

/**
 *
 * @param {Date} date
 * @returns ISO date at the end of a day
 */
export const endOfADay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 59);
  return end.toISOString();
};

export const getDate = (date) => {
  let currentDate;
  if (date) currentDate = dayjs(date);
  else currentDate = dayjs();

  const newDate = currentDate.format("YYYY-MM-DD");

  return newDate;
};

