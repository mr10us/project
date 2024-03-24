import { settingPages } from "../consts";

export default function buildBreadcrumbs(pathname) {
  const steps = pathname.split("/").filter(Boolean);

  const breadcrumbs = steps.map((step, index) => {
    const matchingKey =
    Object.keys(settingPages).find((key) => settingPages[key] === step) ||
    step.charAt(0).toUpperCase() + step.slice(1);
    
    const formattedTitle = matchingKey
    .replace("_", " ")
    .replace("-", " ")
    .replace("%20", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

    if (step === "measurements") return {title: formattedTitle, link: null}
    
    return {
      title: formattedTitle,
      link: "/" + steps.slice(0, index + 1).join("/") + "/",
    };
  });

  return breadcrumbs;
}
