import { App, ConfigProvider, DatePicker } from "antd";
import { useCallback, useEffect, useState } from "react";
import { colors } from "../consts";
import dayjs from "dayjs";
import { findNestedValue } from "../utils/findNestedValue";
import { getMeasurementDates } from "../http/measurementsApi";
import { useGetCustomerID } from "../hooks/useGetCustomerID";

export const SingleDatePicker = ({
  defaultValue: currentDate,
  onChange: handleChangeDate,
}) => {
  const [dates, setDates] = useState([]);

  const { message } = App.useApp();
  const customerID = useGetCustomerID();

  const paintExistingDate = {
    backgroundColor: "rgb(118 182 255)",
  };

  const cellRender = useCallback(
    (current, info) => {
      if (info.type !== "date") {
        return info.originNode;
      }
      if (typeof current === "number") {
        return <div className="ant-picker-cell-inner">{current}</div>;
      }
      // Проверяем, есть ли текущая дата в массиве dates
      const currentDateStr = current.format("YYYY-MM-DD");
      const currentDateExists = dates.some(
        (date) => date.date === currentDateStr
      );

      return (
        <div
          className="ant-picker-cell-inner"
          style={currentDateExists ? paintExistingDate : {}}
        >
          {current.date()}
        </div>
      );
    },
    [dates]
  );

  const fetchCurrentMeasurementDate = async (date) => {
    if (!date) date = dayjs();

    const created_at_after = date
      .clone()
      .subtract(1, "month")
      .format("YYYY-MM-DD");
    const created_at_before = date.clone().add(2, "month").format("YYYY-MM-DD");

    const query = {
      created_at_after: created_at_after,
      created_at_before: created_at_before,
    };
    try {
      const response = await getMeasurementDates(1, query, customerID);
      if (response?.results) setDates(response.results);
    } catch (error) {
      const errorMsg = findNestedValue(error?.repsonse?.data);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    fetchCurrentMeasurementDate();
  }, []);

  return (
    <DatePicker
      onPanelChange={fetchCurrentMeasurementDate}
      onChange={handleChangeDate}
      defaultValue={currentDate}
      style={{ width: 200 }}
      size="large"
      cellRender={cellRender}
    />
  );
};
