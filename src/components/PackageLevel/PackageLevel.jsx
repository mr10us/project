import { Select, Space, ConfigProvider, Flex } from "antd";
import styles from "./PackageLevel.module.css";
import { useTranslation } from 'react-i18next';
import { colors } from "../../consts";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

export const PackageLevel = ({ levels, currentLevel, handleChange, readOnly }) => {
  const { width } = useGetCurrentSize();
  const { t } = useTranslation();

  const coloredContainer = () => {
    switch (currentLevel) {
      case "good":
        return colors.goodBg;
      case "suspicious":
        return colors.suspiciousBg;
      case "warning":
        return colors.warningBg;
      case "critical":
        return colors.criticalBg;
      default:
        return;
    }
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: coloredContainer(),
        width: width < 1200 ? "100%" : "inherit",
      }}
    >
      <Flex
        gap="large"
        align="center"
        justify={width > 768 ? "space-between" : "center"}
      >
        {width > 768 && (
          <p>{t("widgets.packet_level.title")}</p>
        )}
        <ConfigProvider
          theme={{
            components: {
              Select: {
                selectorBg: "transparent",
              },
            },
          }}
        >
          <Select
            disabled={readOnly}
            value={currentLevel}
            style={{
              width: 200,
            }}
            onChange={handleChange}
            options={levels}
          />
        </ConfigProvider>
      </Flex>
    </div>
  );
};
