import { Flex, Space, Form, Button, App } from "antd";
import { PageHeader } from "../../../../components/PageHeader/PageHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { CloseCircleFilled, PlusOutlined } from "@ant-design/icons";
import { CustomEmpty } from "../../../../components/UI/CustomEmpty";
import { colors, alertLevels } from "../../../../consts";
import { useState, useEffect, useMemo } from "react";
import { CustomSegmented } from "../../../../components/CustomSegmented/CustomSegmented";
import { PackageLevel } from "../../../../components/PackageLevel/PackageLevel";
import { Evaluation } from "../../../../components/Evaluation";
import { Measurements } from "./Measurements";
import { CustomerAlerts } from "./CustomerAlerts";
import { MachineAlerts } from "./MachineAlerts";
import {
  editPacket,
  getMeasurements,
  getPacket,
  removePacket,
  sendPacket,
} from "../../../../http/packetsApi";
import { useSelector } from "react-redux";
import { selectCustomerID } from "../../../../features/Customer/customer";
import { useConfirmLeave } from "../../../../hooks/useConfirmLeave";
import { useQuery } from "react-query";
import { Loader } from "../../../../components/Loader";
import { Error } from "../../../../components/Error";
import { useGetCurrentSize } from "../../../../hooks/useGetCurrentSize";
import { PDFViewer } from "../../../../components/PDFViewer";
import { ExportToPDF } from "../../../../components/ExportToPDF";
import { ExportToExcel } from "../../../../components/ExportToExcel";
import { findNestedValue } from "../../../../utils/findNestedValue";
import { getLocaleDate } from "../../../../utils/dateHelper";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../../../../hooks/useGetCurrentLang";
import { useGetLocale } from "../../../../hooks/useGetLocale";
import { checkIfPercent } from "../../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../../utils/Parameters/CalcPercents";
import { getUserName } from "../../../../utils/Users/getUserName";
import { useGetPermissions } from "../../../../hooks/useGetParmissions";

export const Packet = () => {
  const [date, setDate] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [machineAlerts, setMachineAlerts] = useState([]);
  const [customerAlert, setCustomerAlert] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [author, setAuthor] = useState({});

  const [packageLevel, setPackageLevel] = useState(alertLevels.good);
  const [currentTab, setCurrentTab] = useState("measurements");

  const [approveLeave, setApproveLeave] = useState(false);

  const customerID = useSelector(selectCustomerID);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fullpath = pathname.split("/");
  const packetID = fullpath[fullpath.length - 1];
  const { message, modal } = App.useApp();
  const { width } = useGetCurrentSize();
  const { t } = useTranslation();
  const currentLang = useGetCurrentLang();
  const locale = useGetLocale();
  const { role } = useGetPermissions();
  const canOverride = useMemo(() => (role === "guest" ? false : true), [role]);

  const currentDate = useMemo(
    () => getLocaleDate(date, locale),
    [date, currentLang]
  );

  const handleChangeTab = (tab) => {
    setCurrentTab(tab);
  };

  const handleChangeLevel = (level) => {
    setPackageLevel(level);
  };

  const handleFetchMeasurements = (measurements) => {
    setMeasurements(measurements);
  };

  const levels = Object.values(alertLevels);
  const formattedLevels = levels.map((level) => {
    return new Object({
      label: <Evaluation type={level} text />,
      value: level,
    });
  });

  const handleClickAddMeasurements = async () => {
    try {
      const response = await getMeasurements(customerID);
      if (response) handleFetchMeasurements(response);
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
            {canOverride ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleClickAddMeasurements}
              >
                {t("buttons.add.default")}
              </Button>
            ) : null}
          </CustomEmpty>
        ) : (
          <Measurements
            statistics={statistics || []}
            measurements={measurements}
            setTableItemsData={setMeasurements}
          />
        ),
      machine_alerts: (
        <MachineAlerts
          readOnly={!canOverride}
          machineAlerts={machineAlerts}
          setMachineAlerts={setMachineAlerts}
        />
      ),
      customer_alert: (
        <CustomerAlerts
          readOnly={!canOverride}
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

  const handleSendPacket = async () => {
    const status = await sendPacket(packetID);

    if (status === 200) message.success("Packet sent successfuly!");
  };

  const onFinish = async () => {
    setApproveLeave(true);
    const measurementToSend = measurements.map((measurement) => ({
      machine_id: measurement.machine?.id || measurement.machine,
      parameters: measurement.parameters
        .filter((param) => param.type === "measured")
        .map((param) => {
          if (checkIfPercent(param))
            param.number = CalcPercents.toPercents(param.number);
          param.number = parseFloat(param.number);
          if (!param.number) param.number = null;
          return {
            parameter_id: param.parameter.id,
            number: param.number,
          };
        }),
    }));

    const alerts = [
      ...machineAlerts
        .filter((alert) => alert?.title && alert?.description)
        .map((alert) => ({
          danger_level: alert.level,
          title: alert.title,
          content: alert.description,
          recommendation: alert.recommendation,
          recommendation_done: alert.recommendation_done,
          machine_id: alert.machine.id,
          media_files: alert.media
            .map((data) => data?.response)
            .filter(Boolean),
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
          media_files: alert.media
            .map((data) => data?.response)
            .filter(Boolean),
        })),
    ];

    try {
      const response = await editPacket(
        packetID,
        customerID,
        packageLevel,
        measurementToSend,
        alerts.filter(Boolean)
      );
      if (response) {
        message.success(t("messages.success.packet.updated"));
        handleFillStates(response);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const { isLoading, isError, error, isSuccess, remove } = useQuery(
    "getPacket",
    () => getPacket(packetID).then((response) => handleFillStates(response))
  );

  const handleFillStates = (data) => {
    const customerAlert = data.alerts.find((alert) => alert.machine === null);
    setDate(data.created_at);

    // Multiplying measured parameters by 100 if its percantage parameter
    const validMeasurements = data.measurements.map((row) => ({
      ...row,
      parameters: row.parameters.map((parameter) => {
        if (checkIfPercent(parameter)) {
          const number = CalcPercents.toValue(parameter.number);
          return { ...parameter, number: number };
        } else return parameter;
      }),
    }));
    setMeasurements(validMeasurements);

    setAuthor(data.author);

    setMachineAlerts(
      data.alerts
        .filter((alert) => alert.machine !== null)
        .map((alert) => ({
          machine: {
            name: `${alert.machine.model.brand.name} ${alert.machine.model.name}, ID ${alert.machine.internal_number}`,
            id: alert.machine.id,
          },
          title: alert.title,
          description: alert.content,
          recommendation: alert.recommendation,
          recommendation_done: alert.recommendation_done,
          level: alert.danger_level,
          media: alert.media_files.map((media) => ({
            uid: media.id,
            name: media.id,
            status: "done",
            url: media.file,
            response: media.id,
          })),
        }))
    );
    setPackageLevel(data.notify_level);
    setCustomerAlert(
      customerAlert
        ? [
            {
              machine: { name: "", id: -1 },
              title: customerAlert.title,
              description: customerAlert.content,
              recommendation: customerAlert.recommendation,
              recommendation_done: customerAlert.recommendation_done,
              level: customerAlert.danger_level,
              media: customerAlert.media_files.map((media) => ({
                uid: media.id,
                name: media.id,
                status: "done",
                url: media.file,
                response: media.id,
              })),
            },
          ]
        : []
    );
    setStatistics(data.statistics);
  };

  const handleRemovePacket = () => {
    const handleOk = async () => {
      try {
        const response = await removePacket(packetID);
        if (response) {
          setApproveLeave(true);
          navigate(-1);
        }
      } catch (error) {
        const errorMsg = findNestedValue(error?.response?.data || null);
        message.error(errorMsg || error.message);
      }
    };

    modal.confirm({
      icon: <CloseCircleFilled style={{ color: "red", fontSize: 24 }} />,
      title: t("messages.confirm.deletion.packet.title"),
      content: t("messages.confirm.deletion.packet.content"),
      onOk: handleOk,
      okText: t("messages.confirm.deletion.packet.ok_text"),
      cancelText: t("messages.confirm.deletion.packet.cancel_text"),
    });
  };

  useConfirmLeave(!approveLeave);

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <Flex align="center" gap="middle" wrap="wrap">
        <PageHeader title={t("customer.packets.packet.title")} size="medium" />
        <Flex wrap="wrap" align="center">
          <div style={{ padding: "4px 15px" }}>
            <PDFViewer type="packet" id={packetID} />
          </div>
          <div style={{ padding: "4px 15px" }}>
            <ExportToPDF type="packet" id={packetID} />
          </div>
          <div style={{ padding: "4px 15px" }}>
            <ExportToExcel type="packet" id={packetID} />
          </div>
        </Flex>
      </Flex>
      {isLoading && <Loader />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && (
        <>
          <p style={{ marginTop: 12 }}>
            {t("customer.packets.packet.author", {
              name: getUserName(author),
            }) + (author?.phone_number ? ", " + author.phone_number : "")}
          </p>
          <p>{t("customer.packets.packet.date", { date: currentDate })}</p>

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
              readOnly={!canOverride}
              levels={formattedLevels}
              currentLevel={packageLevel}
              handleChange={handleChangeLevel}
            />
          </Flex>
          <Form layout="vertical" onFinish={onFinish} scrollToFirstError>
            {renderTab()}
            <Flex
              gap="middle"
              justify="space-between"
              style={{ flexDirection: width < 425 ? "column-reverse" : "row" }}
            >
              <Space size={"large"}>
                {canOverride && (
                  <Space wrap>
                    <Button type="primary" htmlType="submit">
                      {t("buttons.save")}
                    </Button>
                    <Button type="primary" onClick={handleSendPacket}>
                      {t("buttons.send")}
                    </Button>
                  </Space>
                )}
                {canOverride && (
                  <Button type="primary" danger onClick={handleRemovePacket}>
                    {t("buttons.delete")}
                  </Button>
                )}
              </Space>
              <Space>
                <Button
                  type="primary"
                  disabled={!hasPrevTab}
                  onClick={movePrevTab}
                >
                  {t("buttons.prev_tab")}
                </Button>
                <Button
                  type="primary"
                  disabled={!hasNextTab}
                  onClick={moveNextTab}
                >
                  {t("buttons.next_tab")}
                </Button>
              </Space>
            </Flex>
          </Form>
        </>
      )}
    </>
  );
};
