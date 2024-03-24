import { useMemo, useState } from "react";
import { Card, Flex, Skeleton, Space, Popover, Empty } from "antd";
import { Link, useLocation } from "react-router-dom";
import { Evaluation } from "../Evaluation";
import styles from "./LastPacket.module.css";
import { routes } from "../../consts";
import { getDashboardDate } from "../../utils/dateHelper";
import getHighestAlert from "../../utils/Dashboard/getHighestAlert";
import getMachineName from "../../utils/Dashboard/getMachineName";
import { useGetCurrentLang } from "../../hooks/useGetCurrentLang";
import { useTranslation } from "react-i18next";

export const LastPacket = ({ data, isLoading, style }) => {
  if (data === null)
    return (
      <Card
        style={{ ...style, height: "100%", border: "none" }}
        className="dashboard-widget-container"
      >
        <Skeleton loading={isLoading} active>
          <Empty />
        </Skeleton>
      </Card>
    );

  const currentLang = useGetCurrentLang();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const withOutDashboardPath = pathname.split("dashboard")[0];

  const machines = useMemo(
    () =>
      data.alerts !== null
        ? data.alerts
            // filter customer alert
            .filter((alert) => alert.machine !== null)
            .map((alert) => ({
              name: getMachineName(alert.machine),
              type: alert.danger_level,
            }))
        : [],
    [data]
  );

  const created_at = useMemo(
    () => getDashboardDate(data.created_at, currentLang),
    [data, currentLang]
  );
  const contain_measurements = useMemo(
    () =>
      data.measurements_count > 0
        ? t("widgets.last_packet.+measurements")
        : t("widgets.last_packet.-measurements"),
    [data, currentLang]
  );
  const contain_alerts = useMemo(
    () =>
      data.alerts?.length > 0
        ? t("widgets.last_packet.+alerts")
        : t("widgets.last_packet.-alerts"),
    [data, currentLang]
  );
  const highestLevelAlert = useMemo(
    () => getHighestAlert(data.alerts),
    [data, currentLang]
  );

  return (
    <Card
      style={{ border: "none", height: "100%", ...style }}
      className="dashboard-widget-container"
      loading={isLoading}
      hoverable
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Flex justify="space-between" align="start">
          <Space direction="vertical">
            <h2 className={styles.title}>{t("widgets.last_packet.name")}</h2>
            <p className={styles.date}>{created_at}</p>
          </Space>
          <Evaluation type={data.notify_level} text />
        </Flex>

        <div>
          <p className={styles.instructions}>{contain_measurements}</p>
          <p className={styles.instructions}>{contain_alerts}</p>
        </div>

        <Popover
          placement="topRight"
          content={highestLevelAlert.title}
          trigger="click"
        >
          <Flex justify="space-between" align="center">
            {highestLevelAlert.title.length > innerWidth / 15 ? (
              <p className={styles.warning}>
                {highestLevelAlert.title.slice(0, innerWidth / 15) + " ..."}
              </p>
            ) : (
              <p className={styles.warning}>{highestLevelAlert.title}</p>
            )}
            <Evaluation type={highestLevelAlert.level} size="small" />
          </Flex>
        </Popover>

        <div>
          <Space direction="vertical" style={{ width: "100%" }}>
            <p className={styles.instructions}>
              {t("widgets.last_packet.problem_machines", {
                count: machines.length,
              })}
            </p>
            <Flex wrap="wrap" gap={15}>
              {machines.length > 0 &&
                machines.slice(0, 5).map((machine, index) => (
                  <Space key={index} style={{ width: "30%" }} align="center">
                    <Flex gap={5} align="center">
                      <p>{machine.name}</p>
                      <Evaluation type={machine.type} size="small" />
                    </Flex>
                  </Space>
                ))}
              {machines.length > 4 && (
                <Link to={withOutDashboardPath + routes.CUSTOMERPACKETS}>
                  {t("widgets.last_packet.show_more")}
                </Link>
              )}
            </Flex>
          </Space>
        </div>
      </Space>
    </Card>
  );
};
