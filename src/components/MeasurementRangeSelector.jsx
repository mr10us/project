import { useState, useEffect } from "react";
import { App, Button, Flex, Form, Select, Spin } from "antd";
import { colors } from "../consts";
import { getCustomerMachines } from "../http/customerMachinesApi";
import { useGetCustomerID } from "../hooks/useGetCustomerID";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { findNestedValue } from "../utils/findNestedValue";
import { RangeDatePicker } from "./RangeDatePicker";
import { useTranslation } from "react-i18next";

export const MeasurementRangeSelector = ({ isLoading }) => {
  const [customerMachines, setCustomerMachines] = useState([]);

  const { t } = useTranslation();
  const { message } = App.useApp();
  const customerID = useGetCustomerID();
  const { width } = useGetCurrentSize();

  const handleSetCustomerMachines = (machines) => {
    setCustomerMachines(machines);
  };

  const fetchMachines = async (query) => {
    try {
      const response = await getCustomerMachines(customerID, query);

      if (response) handleSetCustomerMachines(response.results);
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  return (
    <div
      style={{
        backgroundColor: colors.blueHover,
        borderRadius: 8,
        padding: 15,
      }}
    >
      <Flex gap="large" wrap="wrap">
        <Form.Item
          name="machine_id"
          label={t("customer.measurements.for_machine.select.machine")}
        >
          <Select
            style={{ minWidth: 100, width: width - 140, maxWidth: 200 }}
            placeholder={t("placeholders.machine")}
            allowClear
          >
            {customerMachines.map((machine) => (
              <Select.Option key={machine.id} value={machine.id}>
                {machine.model.brand.name +
                  " " +
                  machine.model.name +
                  " " +
                  machine.internal_number}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="date_range"
          label={t("customer.measurements.for_machine.select.period")}
        >
          <RangeDatePicker style={{ maxWidth: 300, width: width - 140 }} />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ padding: "0 24px", alignSelf: "center" }}
        >
          {t("buttons.apply")}
        </Button>
        <Spin spinning={isLoading} style={{ alignSelf: "center" }} />
      </Flex>
    </div>
  );
};
