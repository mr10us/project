import { ExclamationCircleTwoTone, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Collapse,
  Flex,
  Space,
  Form,
  App,
  Tooltip,
  Select,
} from "antd";
import { CustomEmpty } from "../../../../components/UI/CustomEmpty";
import { useEffect, useState } from "react";
import { AlertForm } from "../../../../components/AlertForm";
import { CustomModal } from "../../../../components/Modal/CustomModal";
import { Search } from "../../../../components/UI/Search/Search";
import { getCustomerMachines } from "../../../../http/customerMachinesApi";
import { useGetCustomerID } from "../../../../hooks/useGetCustomerID";
import { colors } from "../../../../consts";
import { useGetCurrentSize } from "../../../../hooks/useGetCurrentSize";
import { findNestedValue } from "../../../../utils/findNestedValue";
import { useTranslation } from "react-i18next";

export const MachineAlerts = ({
  machineAlerts,
  setMachineAlerts,
  readOnly,
}) => {
  const [machines, setMachines] = useState(machineAlerts || []);
  const [fetchedMachineModels, setFetchedMachineModels] = useState([]);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [activeKey, setActiveKey] = useState([]);

  const { t } = useTranslation();
  const customerID = useGetCustomerID();
  const { message, modal } = App.useApp();
  const { width } = useGetCurrentSize();

  const [open, setOpen] = useState(false);
  const handleModalClose = () => {
    setOpen(false);
  };
  const handleModalOpen = () => {
    setOpen(true);
  };
  const handleAdd = ({ machine: selectedMachine }) => {
    const machine = fetchedMachineModels.find(
      (machine) => machine.value === selectedMachine
    );
    setActiveKey([machine.value]);

    setMachines((prev) => [
      ...prev,
      { machine: { id: machine.value, name: machine.label } },
    ]);
    setAvailableMachines((prev) =>
      prev.filter((machine) => machine.value !== selectedMachine)
    );

    handleModalClose();
  };

  const confirmDelete = (machineID) => {
    modal.confirm({
      title: t("messages.confirm.deletion.machine_alert.title"),
      content: t("messages.confirm.deletion.machine_alert.content"),
      type: "warning",
      onOk: () => handleDelete(machineID),
      okText: t("messages.confirm.deletion.machine_alert.ok_text"),
      cancelText: t("messages.confirm.deletion.machine_alert.cancel_text"),
      cancelButtonProps: { style: { color: "red" } },
      icon: (
        <ExclamationCircleTwoTone
          twoToneColor={"red"}
          style={{ fontSize: 32 }}
        />
      ),
      centered: true,
    });
  };
  const handleDelete = (machineID) => {
    setAvailableMachines(
      fetchedMachineModels.filter((machine) => machine.id !== machineID)
    );
    setMachines((prev) => prev.filter((item) => item.machine.id !== machineID));
  };

  const accordionOnChange = (values) => {
    setActiveKey(values);
  };

  const fetchMachine = async () => {
    try {
      const response = await getCustomerMachines(customerID);

      if (response) {
        setFetchedMachineModels(
          response.results.map((machine) => ({
            label: `${machine.model.brand.name} ${machine.model.name}, ID ${machine.internal_number}`,
            value: machine.id,
          }))
        );
        setAvailableMachines(
          response.results
            .map((machine) => ({
              label: `${machine.model.brand.name} ${machine.model.name}, ID ${machine.internal_number}`,
              value: machine.id,
            }))
            .filter((machine) => {
              if (machineAlerts.length === 0) return true;
              const active = machineAlerts.find(
                (item) => item.machine.id !== machine.value
              );
              return Boolean(active);
            })
        );
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    fetchMachine();
  }, []);

  useEffect(() => {
    setMachineAlerts(machines);
  }, [machines]);

  return (
    <>
      <CustomModal
        title={t("modals.machine_alerts.title")}
        open={open}
        onClose={handleModalClose}
      >
        <Form layout="vertical" style={{ width: "80%" }} onFinish={handleAdd}>
          <Form.Item
            name="machine"
            label={t("labels.machine")}
            rules={[{ required: true, message: t("rules.machine") }]}
          >
            <Select
              options={availableMachines}
              placeholder={t("placeholders.machine")}
              showSearch
              filterOption={(input, option) =>
                (option?.label.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {t("buttons.add.default")}
          </Button>
        </Form>
      </CustomModal>

      <Flex vertical gap="large" style={{ marginBottom: 40 }}>
        {!readOnly ? (
          <Space size="large">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleModalOpen}
            />
            <p>{t("buttons.add.machine_alert")}</p>
          </Space>
        ) : null}
        {machines.length === 0 ? (
          <CustomEmpty
            style={{
              backgroundColor: colors.lightGray,
              borderRadius: 8,
              padding: "32px 0",
            }}
          />
        ) : (
          machines.map((item) => (
            <Form.Item key={item.machine.id}>
              <Collapse
                className="alignCenter"
                onChange={accordionOnChange}
                activeKey={activeKey}
                size="large"
                expandIconPosition="start"
                items={[
                  {
                    key: item.machine.id,
                    label: (
                      <Flex justify="space-between" gap={15} align="center">
                        <span
                          style={{
                            padding: "0 12px",
                            fontWeight: "bold",
                            height: "fit-content",
                          }}
                        >
                          <Tooltip title={item.machine.name}>
                            {width < 425
                              ? item.machine.name.slice(0, width / 100) + "..."
                              : item.machine.name}
                          </Tooltip>
                        </span>
                        <Button
                          style={{ padding: "4px 8px" }}
                          type="primary"
                          danger
                          onClick={() => confirmDelete(item.machine.id)}
                        >
                          {t("buttons.remove.default")}
                        </Button>
                      </Flex>
                    ),
                    children: (
                      <AlertForm
                        alert={item}
                        onChange={setMachines}
                        readOnly={readOnly}
                      />
                    ),
                  },
                ]}
              />
            </Form.Item>
          ))
        )}
      </Flex>
    </>
  );
};
