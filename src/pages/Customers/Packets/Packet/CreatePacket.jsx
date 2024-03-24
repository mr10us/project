import { useState, useEffect, useMemo } from "react";
import { Flex, Space, Form, Button, message, App } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "../../../../components/PageHeader/PageHeader";
import { CustomEmpty } from "../../../../components/UI/CustomEmpty";
import { colors, alertLevels } from "../../../../consts";
import { CustomSegmented } from "../../../../components/CustomSegmented/CustomSegmented";
import { PackageLevel } from "../../../../components/PackageLevel/PackageLevel";
import { Evaluation } from "../../../../components/Evaluation";
import { Measurements } from "./Measurements";
import { CustomerAlerts } from "./CustomerAlerts";
import { MachineAlerts } from "./MachineAlerts";
import { createPacket, getMeasurements } from "../../../../http/packetsApi";
import { useConfirmLeave } from "../../../../hooks/useConfirmLeave";
import { useGetCurrentSize } from "../../../../hooks/useGetCurrentSize";
import { findNestedValue } from "../../../../utils/findNestedValue";
import { useGetCustomerID } from "../../../../hooks/useGetCustomerID";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../../../../hooks/useGetCurrentLang";
import { getLocaleDate } from "../../../../utils/dateHelper";
import { useGetLocale } from "../../../../hooks/useGetLocale";
import { checkIfPercent } from "../../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../../utils/Parameters/CalcPercents";

export const CreatePacket = () => {
  const [measurements, setMeasurements] = useState([]);
  const [machineAlerts, setMachineAlerts] = useState([]);
  const [customerAlert, setCustomerAlert] = useState([]);

  const [packageLevel, setPackageLevel] = useState(alertLevels.good);
  const [currentTab, setCurrentTab] = useState("measurements");

  const [approveLeave, setApproveLeave] = useState(true);

  const customerID = useGetCustomerID();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { message } = App.useApp();
  const { width } = useGetCurrentSize();
  const { t } = useTranslation();
  const currentLang = useGetCurrentLang();
  const locale = useGetLocale();

  const currentDate = useMemo(() => getLocaleDate(null, locale), [currentLang]);

  const handleChangeTab = (tab) => {
    setCurrentTab(tab);
  };

  const savePacket = async () => {
    const measurementToSend = measurements.map((measurement) => ({
      machine_id: measurement.machine?.id || measurement.machine,
      parameters: measurement.parameters
        .filter((param) => param.type === "measured")
        .map((param) => {
          if (checkIfPercent(param))
            param.number = CalcPercents.toPercents(param.number);
          if (param.number === "") param.number = null;
          return {
            parameter_id: param.parameter.id,
            number: param.number,
          };
        }),
    }));

    const alerts = [
      ...machineAlerts.map((alert) => ({
        danger_level: alert.level,
        title: alert.title,
        content: alert.description,
        recommendation: alert.recommendation,
        recommendation_done: alert.recommendation_done,
        machine_id: alert.machine.id,
        media_files: alert.media.map((data) => data?.response),
      })),
      ...customerAlert
        .filter((alert) => alert?.title && alert?.description)
        .map((alert) => ({
          danger_level: alert.level,
          title: alert.title,
          content: alert.description,
          recommendation: alert.recommendation,
          recommendation_done: alert.recommendation_done,
          machine_id: null,
          media_files: alert.media.map((data) => data?.response) || [],
        })),
    ];

    try {
      const response = await createPacket(
        customerID,
        packageLevel,
        measurementToSend,
        alerts.filter(Boolean)
      );
      if (response) {
        setApproveLeave(true);
        message.success(t("messages.success.packet.created"));
        navigate(pathname.split("create")[0] + response.id);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const levels = Object.values(alertLevels);
  const formattedLevels = levels.map((level) => {
    return {
      label: <Evaluation type={level} text />,
      value: level,
    };
  });

  const handleClickAddMeasurements = async () => {
    try {
      const response = await getMeasurements(customerID);
      if (response) {
        if (response?.length === 0)
          message.info(t("messages.info.packet.no_measurements"));
        setMeasurements(
          response.map((measurement) => ({
            ...measurement,
            parameters: measurement.parameters.map((param) => {
              if (checkIfPercent(param))
                param.number = CalcPercents.toValue(param.number);

              return param;
            }),
          }))
        );
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const tabItems = useMemo(
    () => ({
      measurements:
        measurements.length === 0 ? (
          <CustomEmpty
            description={t("customer.packets.packet.no_measurements")}
            style={{ padding: 30, backgroundColor: colors.lightGray }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleClickAddMeasurements}
            >
              {t("buttons.add.default")}
            </Button>
          </CustomEmpty>
        ) : (
          <Measurements
            statistics={[]}
            measurements={measurements}
            setTableItemsData={setMeasurements}
          />
        ),
      machine_alerts: (
        <MachineAlerts
          machineAlerts={machineAlerts}
          setMachineAlerts={setMachineAlerts}
        />
      ),
      customer_alert: (
        <CustomerAlerts
          customerAlert={customerAlert}
          setCustomerAlert={setCustomerAlert}
        />
      ),
    }),
    [currentLang, customerAlert, machineAlerts, measurements]
  );

  const formatedTabs = useMemo(() => {
    return Object.keys(tabItems).map((tab) => ({
      label: t(`customer.packets.packet.switch.${tab}`),
      value: tab,
    }));
  }, [currentLang]);

  const hasNextTab = currentTab !== formatedTabs[formatedTabs.length - 1].value;
  const hasPrevTab = currentTab !== formatedTabs[0].value;

  const renderTab = () => {
    const tab = formatedTabs.find((tab) => tab.value === currentTab);

    return tabItems[tab.value];
  };

  const moveNextTab = () => {
    const currentIndex = formatedTabs.findIndex(
      (tab) => tab.value === currentTab
    );
    setCurrentTab(formatedTabs[currentIndex + 1].value);
  };

  const movePrevTab = () => {
    const currentIndex = formatedTabs.findIndex(
      (tab) => tab.value === currentTab
    );
    setCurrentTab(formatedTabs[currentIndex - 1].value);
  };

  useConfirmLeave(!approveLeave);

  useEffect(() => {
    if (measurements.length > 0) setApproveLeave(false);
    else setApproveLeave(true);
  }, [measurements]);

  return (
    <>
      <PageHeader
        title={t("customer.packets.create_packet.title")}
        size="medium"
      />
      <p style={{ marginTop: 12 }}>
        {t("customer.packets.create_packet.date", { date: currentDate })}
      </p>

      <Flex
        style={{
          margin: "40px 0",
          flexDirection: width < 1200 ? "column-reverse" : "row",
        }}
        align="center"
        gap="large"
        justify="space-between"
      >
        <CustomSegmented
          tabItems={formatedTabs}
          currentTab={currentTab}
          handleChange={handleChangeTab}
        />
        <PackageLevel
          levels={formattedLevels}
          currentLevel={packageLevel}
          handleChange={setPackageLevel}
        />
      </Flex>
      <Form layout="vertical" onFinish={savePacket}>
        {renderTab()}
        <Flex
          gap="middle"
          justify="space-between"
          style={{ flexDirection: width < 425 ? "column-reverse" : "row" }}
        >
          <Space>
            <Button type="primary" htmlType="submit">
              {t("buttons.save")}
            </Button>
          </Space>
          <Space>
            <Button type="primary" disabled={!hasPrevTab} onClick={movePrevTab}>
              {t("buttons.prev_tab")}
            </Button>
            <Button type="primary" disabled={!hasNextTab} onClick={moveNextTab}>
              {t("buttons.next_tab")}
            </Button>
          </Space>
        </Flex>
      </Form>
    </>
  );
};
