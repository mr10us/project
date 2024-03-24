import { useEffect, useMemo, useState } from "react";
import { ConfigProvider, App } from "antd";
import { StandartTable } from "./UI/StandartTable/StandartTable";
import { PageHeader } from "./PageHeader/PageHeader";
import { colors } from "../consts";
import { calcStatsParams } from "../utils/calcStatsParams";
import { getCustomerLite } from "../http/customersApi";
import { useGetCustomerID } from "../hooks/useGetCustomerID";
import { getParameterName } from "../utils/Parameters/langParamsHelper";
import { numberFormatToString } from "../utils/numberFormat";
import { findNestedValue } from "../utils/findNestedValue";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../hooks/useGetCurrentLang";
import { getUniqueParams } from "../utils/getUniqueParams";

export const PacketStatistics = ({ params, statistics }) => {
  const [statisticParams, setStatisticParams] = useState([]);
  const [displayedParams, setDisplayedParams] = useState([]);

  const { t } = useTranslation();
  const customerID = useGetCustomerID();
  const { message } = App.useApp();
  const currentLang = useGetCurrentLang();

  const columns = useMemo(
    () => [
      {
        title: t("customer.packets.packet.statistics.columns.parameter"),
        dataIndex: "parameter",
        key: "parameter",
      },
      {
        title: t("customer.packets.packet.statistics.columns.average"),
        dataIndex: "average",
        key: "average",
      },
      {
        title: t("customer.packets.packet.statistics.columns.median"),
        dataIndex: "median",
        key: "median",
      },
      {
        title: t("customer.packets.packet.statistics.columns.stdv"),
        dataIndex: "stdv",
        key: "stdv",
      },
      {
        title: t("customer.packets.packet.statistics.columns.cv"),
        dataIndex: "cv",
        key: "cv",
      },
    ],
    [currentLang]
  );

  const handleSetDisplayedParams = (disParams) => {
    if (disParams?.length === 0) {
      const uniqueParams = getUniqueParams(params.flat() || []);
      const displayedParams = uniqueParams.filter(
        (param) => param.type !== "static"
      );
      setDisplayedParams(displayedParams.map((item) => item.parameter.id));
    } else
      setDisplayedParams(
        disParams
          .filter((param) => param.is_statistical)
          .map((item) => item.parameter.id)
      );
  };

  const handleSetStatisticParams = () => {
    const paramsToDisplay = calcStatsParams(displayedParams, params);

    const toDisplay = {};

    params &&
      params.forEach((parameterList) =>
        parameterList.forEach((paramData) => {
          const itemToDisplay = paramsToDisplay.find(
            (parameter) => parameter.id == paramData.parameter.id
          );
          if (itemToDisplay)
            if (!toDisplay[itemToDisplay.id]) {
              const paramName =
                paramData.parameter.name[currentLang] ||
                paramData.parameter.name.en;
              const paramShortUnit =
                paramData.parameter?.short_unit[currentLang] ||
                paramData.parameter?.short_unit.en || "";

              toDisplay[itemToDisplay.id] = {
                key: itemToDisplay.id,
                parameter: paramData.parameter.variable_name + ", " + paramName,
                average: itemToDisplay.average + " " + paramShortUnit,
                median: itemToDisplay.median + " " + paramShortUnit,
                stdv: itemToDisplay.stdv + " " + paramShortUnit,
                cv: itemToDisplay.cv,
              };
            }
        })
      );
    const newStatisticParams = Object.values(toDisplay);
    newStatisticParams.length > 0 && setStatisticParams(newStatisticParams);
  };

  const handleSetInitialStatistic = () => {
    setStatisticParams(
      statistics.map((stat) => {
        const paramShortUnit =
          stat.parameter.short_unit[currentLang] ||
          stat.parameter.short_unit.en || "";

        return {
          key: stat.parameter.id,
          parameter: getParameterName(stat.parameter, currentLang),
          average:
            numberFormatToString(Number(stat.average)) + " " + paramShortUnit,
          median:
            numberFormatToString(Number(stat.median)) + " " + paramShortUnit,
          stdv:
            numberFormatToString(Number(stat.standard_deviation)) +
            " " +
            paramShortUnit,
          cv: numberFormatToString(Number(stat.cofficient_of_variation)),
        };
      })
    );
  };

  const fetchCustomerDisplayedParameters = async () => {
    try {
      const response = await getCustomerLite(customerID);
      if (response) handleSetDisplayedParams(response.displayed_parameters);
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    handleSetStatisticParams();
  }, [params, currentLang, displayedParams]);

  useEffect(() => {
    statistics && handleSetInitialStatistic();
    fetchCustomerDisplayedParameters();
  }, []);

  return (
    <>
      <PageHeader
        title={t("customer.packets.packet.statistics.title")}
        size="medium"
      />
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: "#e3f1ff",
            },
          },
          token: {
            colorBgContainer: colors.lightBlue,
          },
        }}
      >
        <StandartTable
          items={statisticParams.length > 0 ? statisticParams : []}
          columns={columns}
        />
      </ConfigProvider>
    </>
  );
};
