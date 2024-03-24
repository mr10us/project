import { useTranslation } from "react-i18next";

const evalTypes = {
  good: "bg-c_good",
  suspicious: "bg-c_suspicious",
  warning: "bg-c_warning",
  critical: "bg-c_critical",
  null: "",
};

const sizes = {
  extraLarge: "circle_xl",
  large: "circle_l",
  medium: "circle_m",
  small: "circle_s",
};

export const Evaluation = ({ type, text, size = "large", style }) => {
  const { t } = useTranslation();

  type = String(type);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: "center",
        width: "fit-content",
        ...style,
      }}
    >
      <div className={`circle ${sizes[size]} ${evalTypes[type]}`} />
      {text && <p>{t(`evaluations.${type}`)}</p>}
    </div>
  );
};
