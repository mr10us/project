import { useEffect, useState } from "react";
import { ConfigProvider, App } from "antd";
import { StandartTable } from "./UI/StandartTable/StandartTable";
import { PageHeader } from "./PageHeader/PageHeader";
import { colors } from "../consts";
import { useSelector } from "react-redux";
import { selectCurrentLang } from "../features/CurrentLang/currentLang";
import { getParameterName } from "../utils/Parameters/langParamsHelper";
import { numberFormatToString } from "../utils/numberFormat";

const columns = [
  { title: "Parameter", dataIndex: "parameter", key: "parameter" },
  { title: "Average", dataIndex: "average", key: "average" },
  { title: "Median", dataIndex: "median", key: "median" },
  { title: "Standard deviation", dataIndex: "stdv", key: "stdv" },
  {
    title: "Coefficient of variation",
    dataIndex: "cv",
    key: "cv",
  },
];

export const DisplayStatistics = ({ statistics }) => {
  const [statisticParams, setStatisticParams] = useState([]);

  const currentLang = useSelector(selectCurrentLang);

  const handleSetInitialStatistic = () => {
    setStatisticParams(
      statistics.map((stat) => ({
        key: stat.parameter.id,
        parameter: getParameterName(stat.parameter, currentLang),
        average:
          numberFormatToString(Number(stat.average)) +
          " " +
          stat.parameter.short_unit[currentLang],
        median:
          numberFormatToString(Number(stat.median)) +
          " " +
          stat.parameter.short_unit[currentLang],
        stdv:
          numberFormatToString(Number(stat.standard_deviation)) +
          " " +
          stat.parameter.short_unit[currentLang],
        cv: numberFormatToString(Number(stat.cofficient_of_variation)),
      }))
    );
  };

  useEffect(() => {
    statistics && handleSetInitialStatistic();
  }, []);

  return (
    <>
      <PageHeader title="Statistics" size="medium" />
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
