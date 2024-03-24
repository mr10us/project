import { customerPages } from "../consts";

export default function getCustomerPage(path) {
  if (typeof path === "string")
    for (const [key, value] of Object.entries(customerPages)) {
      if (path.includes(value)) return key.toLowerCase();
    }
  
  return "dashboard"
}
