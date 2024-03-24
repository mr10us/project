import { ConfigProvider, Segmented } from "antd";
import styles from "./CustomSegmented.module.css";
import { colors } from "../../consts";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";
import { useMemo } from "react";
import { useGetCurrentLang } from "../../hooks/useGetCurrentLang";

export const CustomSegmented = ({ tabItems, currentTab, handleChange }) => {
  const { width } = useGetCurrentSize();
  const currentLang = useGetCurrentLang();

  const options = useMemo(
    () =>
      tabItems.map(({ label, value }) => ({
        label: label,
        value: value,
      })),
    [currentLang]
  );
  return (
    <div
      className={styles.container}
      style={{ width: width < 1200 ? "100%" : "inherit" }}
    >
      <ConfigProvider
        theme={{
          components: {
            Segmented: {
              itemColor: colors.gray,
            },
          },
          token: { colorBgLayout: "transparent" },
        }}
      >
        <Segmented
          block
          options={options}
          onChange={handleChange}
          value={currentTab}
          defaultValue={options[0]}
          style={{ userSelect: "none" }}
        />
      </ConfigProvider>
    </div>
  );
};
