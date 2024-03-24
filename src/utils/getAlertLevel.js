import { alertLevels } from "../consts";

export const getAlertLevel = (level) => {
  return Object.values(alertLevels).indexOf(level) + 1;
};