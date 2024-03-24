import React from "react";
import {
  Input,
  Select,
  Form,
  Tabs,
  Flex,
  Space,
  Button,
  App,
} from "antd";
import { defaultOptions, langs, routes } from "../../../consts";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { createParameter } from "../../../http/parametersApi";
import { useNavigate } from "react-router-dom";
import {
  extractLangFromKey,
  formatToValidObj,
} from "../../../utils/Parameters/langParamsHelper";
import { useTranslation } from 'react-i18next';
import { findNestedValue } from "../../../utils/findNestedValue";

const items = Object.values(langs).map((lang) => ({
  key: lang,
  label: lang.toUpperCase(),
  children: (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Form.Item
        label="Name"
        labelAlign="left"
        name={`name_${lang}`}
      >
        <Input
          placeholder={`Enter identifier name for ${lang.toUpperCase()}`}
        />
      </Form.Item>
      <Flex justify="space-between">
        <Form.Item
          name={`unit_${lang}`}
          label="Unit"
          style={{ width: "45%" }}
          labelAlign="left"
        >
          <Input placeholder={`Enter unit label for ${lang.toUpperCase()}`} />
        </Form.Item>
        <Form.Item
          name={`shortUnit_${lang}`}
          label="Short Unit"
          style={{ width: "45%" }}
          labelAlign="left"
        >
          <Input
            placeholder={`Enter short unit label for ${lang.toUpperCase()}`}
          />
        </Form.Item>
      </Flex>
    </Space>
  ),
}));

export const AddParameter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const handleAddParameter = async (values) => {
    const names = extractLangFromKey(values, "name");
    const units = extractLangFromKey(values, "unit");
    const shortUnits = extractLangFromKey(values, "shortUnit");

    const namesFormatted = formatToValidObj(names);
    const unitsFormatted = formatToValidObj(units);
    const shortsFormatted = formatToValidObj(shortUnits);

    try {
      const type = defaultOptions.find((item) => item.value === values.type);
      const response = await createParameter(
        type.key,
        values.variable_name,
        namesFormatted,
        unitsFormatted,
        shortsFormatted
      );

      if (response) navigate(-1);
    } catch (error) {
      // if (error?.response?.data && typeof error?.response?.data !== "string") {
      //   const errorFields = handleErrorFields(error.response.data);
      //   form.setFields(errorFields);
      // } else {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
      // }
    }
  };

  return (
    <>
      <PageHeader title={t("settings.parameters.add.title")} margin />
      <Form
        layout="vertical"
        size="large"
        onFinish={handleAddParameter}
        initialValues={{ type: defaultOptions[0].value }}
        form={form}
      >
        <Form.Item>
          <Flex justify="space-between" wrap>
            <Form.Item
              name="variable_name"
              label="Identifier"
              style={{ width: "45%" }}
              rules={[
                { required: true, message: "Identifier should not be empty" },
              ]}
            >
              <Input placeholder="Enter the identifier..." />
            </Form.Item>
            <Form.Item name="type" label="Type" style={{ width: "45%" }}>
              <Select options={defaultOptions} />
            </Form.Item>
          </Flex>
        </Form.Item>
        <Form.Item
          style={{
            backgroundColor: "#f0f8ff",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <h2>{t("settings.parameters.add.locales")}</h2>

          <Tabs defaultActiveKey="1" items={items} type="card" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ padding: "0 64px" }}
          >
            {t("buttons.save")}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
