import { Card, Skeleton, Flex, Space, Col, Row } from "antd";
import { useMemo, useState } from "react";
import styles from "./AlertsForMonth.module.css";
import { Evaluation } from "../Evaluation";
import dayjs from "dayjs";
import getMachineName from "../../utils/Dashboard/getMachineName";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../../hooks/useGetCurrentLang";
import { getDateDiapazone } from "../../utils/dateHelper";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

export const AlertsForMonth = ({ data, isLoading, style }) => {
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

  const { width } = useGetCurrentSize();
  const { t } = useTranslation();
  const currentLang = useGetCurrentLang();

  const dateDiapazone = useMemo(
    () => getDateDiapazone(data.start, data.end, currentLang),
    [data, currentLang]
  );

  const totalAlerts = useMemo(() => data.total, [data]);

  const customerAlertsAmount = useMemo(
    () => data.customer_levels.length,
    [data]
  );
  const customerAlerts = useMemo(
    () =>
      data.customer_levels.reduce((prev, customer) => {
        const { danger_level: level, count } = customer;
        return { ...prev, [level]: count };
      }, {}),
    [data]
  );
  const machineAlertsAmount = useMemo(() => data.machine_levels.length, [data]);
  const machineAlerts = useMemo(
    () =>
      data.machine_levels.reduce((prev, machine) => {
        const { danger_level: level, count } = machine;
        return { ...prev, [level]: count };
      }, {}),
    [data]
  );

  const problematicMachine = useMemo(
    () =>
      data.worst_machine !== null
        ? getMachineName(data.worst_machine)
        : t("widgets.alerts_for_month.no_machine"),
    [data, currentLang]
  );
  const problematicEvals = useMemo(
    () =>
      data.worst_machine_levels.reduce((prev, machine) => {
        const { danger_level: level, count } = machine;
        return { ...prev, [level]: count };
      }, {}),
    [data]
  );

  return (
    <Card
      style={{ ...style, border: "none" }}
      className="dashboard-widget-container"
      loading={isLoading}
      hoverable
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <Space direction="vertical">
            <h2 className={styles.title}>
              {t("widgets.alerts_for_month.name")}
            </h2>
            <p className={styles.date}>{dateDiapazone}</p>
          </Space>
          <p className={styles.alertsNumbers}>{totalAlerts}</p>
        </Flex>

        <Flex style={{ height: "100%" }} wrap="wrap" gap={"small"}>
          <Space size="small" direction="vertical">
            <p className={styles.padTitle}>
              {t("widgets.alerts_for_month.customer")}
            </p>
            <p className={styles.padSubtitle}>{customerAlertsAmount}</p>
            <Space direction="vertical">
              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="suspicious" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {customerAlerts?.suspicious ? customerAlerts.suspicious : 0}
                  </p>
                </Col>
              </Row>

              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="warning" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {customerAlerts?.warning ? customerAlerts.warning : 0}
                  </p>
                </Col>
              </Row>

              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="critical" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {customerAlerts?.critical ? customerAlerts.critical : 0}
                  </p>
                </Col>
              </Row>
            </Space>
          </Space>
          <div className="divider"></div>
          <Space size="small" direction="vertical">
            <p className={styles.padTitle}>
              {t("widgets.alerts_for_month.machines")}
            </p>
            <p className={styles.padSubtitle}>{machineAlertsAmount}</p>
            <Space direction="vertical">
              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="suspicious" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {machineAlerts?.suspicious ? machineAlerts.suspicious : 0}
                  </p>
                </Col>
              </Row>
              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="warning" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {machineAlerts?.warning ? machineAlerts.warning : 0}
                  </p>
                </Col>
              </Row>
              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="critical" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {machineAlerts?.critical ? machineAlerts.critical : 0}
                  </p>
                </Col>
              </Row>
            </Space>
          </Space>
          <div className="divider"></div>
          <Space size="small" direction="vertical">
            <p className={styles.padTitle}>
              {t("widgets.alerts_for_month.most_problematic")}
            </p>
            <p className={styles.padSubtitle}>{problematicMachine}</p>
            <Space direction="vertical">
              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="suspicious" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {problematicEvals?.suspicious
                      ? problematicEvals.suspicious
                      : 0}
                  </p>
                </Col>
              </Row>
              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="warning" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {problematicEvals?.warning ? problematicEvals.warning : 0}
                  </p>
                </Col>
              </Row>
              <Row gutter={[32, 32]}>
                <Col span={16}>
                  <Evaluation type="critical" text />
                </Col>
                <Col span={6} offset={2}>
                  <p className={styles.evalCount}>
                    {problematicEvals?.critical ? problematicEvals.critical : 0}
                  </p>
                </Col>
              </Row>
            </Space>
          </Space>
        </Flex>
      </Space>
    </Card>
  );
};
