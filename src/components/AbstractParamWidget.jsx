import { Space } from "antd";
import { Link } from "react-router-dom";
import { colors, routes } from "../consts";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { useTranslation } from 'react-i18next';

export const AbstractParamWidget = () => {
  const { width } = useGetCurrentSize();
  const { t } = useTranslation();

  return (
    <div
      className="dashboard-widget-container"
      style={{
        borderRadius: 12,
        padding: width < 425 ? "4px 8px" : "12px 24px",
        fontSize: width < 425 ? 12 : "initial",
      }}
    >
      <Space size="large">
        <p>{t("widgets.abstract.content")}</p>
        <Link
          to={routes.ABSTRACTPARAMS}
          style={{
            display: "block",
            border: `1px solid ${colors.blue}`,
            borderRadius: 6,
            padding: "6px 12px"
          }}
        >
          {t("widgets.abstract.name")}
        </Link>
      </Space>
    </div>
  );
};
