import { useState } from "react";
import { Form, Button, Select } from "antd";
import { CustomModal } from "../CustomModal";
import { useTranslation } from "react-i18next";

export const CustomerSettingsModal = ({
  open,
  handleClose,
  addParameter,
  uniqParamsArray,
}) => {
  const handleAddParameter = ({ parameter }) => {
    addParameter(parameter);

    handleClose();
  };

  const { t } = useTranslation();

  return (
    <CustomModal
      title={t("buttons.add.parameter")}
      open={open}
      onClose={handleClose}
    >
      <Form
        layout="vertical"
        style={{ width: "80%" }}
        onFinish={handleAddParameter}
      >
        <Form.Item
          name="parameter"
          rules={[{ required: true, message: t("rules.parameter") }]}
        >
          <Select
            showSearch
            allowClear
            options={uniqParamsArray}
            placeholder={t("placeholders.parameter")}
            filterOption={(input, option) =>
              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" block htmlType="submit">
            {t("buttons.add.default")}
          </Button>
        </Form.Item>
      </Form>
    </CustomModal>
  );
};
