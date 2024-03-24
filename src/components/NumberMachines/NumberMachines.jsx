import { Card, Skeleton, Flex, Space, Tooltip } from "antd";
import { useMemo, useState } from "react";
import styles from "./NumberMachines.module.css";
import { CustomEmpty } from "../UI/CustomEmpty";
import { useTranslation } from "react-i18next";

export const NumberMachines = ({ data, isLoading }) => {
  if (data === null)
    return (
      <Card
        style={{ border: "none", height: "100%" }}
        className="dashboard-widget-container"
      >
        <Skeleton loading={isLoading} active>
          <CustomEmpty description={"No data"} />
        </Skeleton>
      </Card>
    );

  const { t } = useTranslation();

  const numberOfMachines = useMemo(() => data.total, [data]);
  const topMachines = useMemo(
    () =>
      data.top_models.length > 0
        ? data.top_models.map((machine) => {
            const name = `${machine.brand_name} ${machine.name} `;
            const machineName =
              name.length > 15 ? name.slice(0, 15) + "... " : name;
            return {
              fullName: name,
              name: machineName,
              count: machine.count,
            };
          })
        : [],
    [data]
  );

  return (
    <Card
      className="dashboard-widget-container"
      style={{ height: "100%", border: "none" }}
      hoverable
      loading={isLoading}
    >
      <Flex
        vertical
        justify="space-between"
        gap="middle"
        style={{ height: "100%" }}
      >
        <h2 className={styles.title}>{t("widgets.number_of_machines.name")}</h2>
        <p className={styles.machineNumbers}>{numberOfMachines}</p>
        {topMachines.length > 0 && (
          <Space direction="vertical" size="small">
            {topMachines.map((machine) => (
              <Tooltip title={machine.fullName} key={machine.name}>
                <p className={styles.machine}>
                  {machine.name}
                  <span>({machine.count})</span>
                </p>
              </Tooltip>
            ))}
          </Space>
        )}
      </Flex>
    </Card>
  );
};
