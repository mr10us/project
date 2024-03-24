import { App, DatePicker } from "antd";
import { getMeasurementDates } from "../http/measurementsApi";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { findNestedValue } from "../utils/findNestedValue";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { colors } from "../consts";
import { useGetCustomerID } from "../hooks/useGetCustomerID";

export const RangeDatePicker = ({ onChange, style = {} }) => {
  const [dates, setDates] = useState();

  const { width } = useGetCurrentSize();
  const { message } = App.useApp();
  const customerID = useGetCustomerID();

  const handleChange = (date) => {
    onChange(date);
  };

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
    if (!date) date = [dayjs(), dayjs().add(1, "month")];
    if (date[1] === null) date[1] = dayjs().add(1, "month");

    const created_at_after = date[0]
      .clone()
      .subtract(2, "month")
      .format("YYYY-MM-DD");
    const created_at_before = date[1]
      .clone()
      .add(3, "month")
      .format("YYYY-MM-DD");

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
    <DatePicker.RangePicker
      placement={width < 565 ? "bottomRight" : null}
      onPanelChange={fetchCurrentMeasurementDate}
      picker="date"
      style={{ marginBottom: 20, ...style }}
      size="large"
      cellRender={cellRender}
      onChange={handleChange}
    />
  );
};
