import { settingPages } from "../consts";

export default function getSettingPage(path) {
  if (typeof path === "string")
    for (const [key, value] of Object.entries(settingPages)) {
      if (path.includes(value)) return key.toLowerCase();
    }
  
  return "machines";
}
