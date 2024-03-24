import { useEffect, useState } from "react";
import {
  Input,
  Select,
  Form,
  Tabs,
  Flex,
  Space,
  Button,
  Spin,
  App,
} from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { useLocation, useNavigate } from "react-router-dom";
import {
  editParameter,
  getParameter,
  removeParameter,
} from "../../../http/parametersApi";
import {
  extractLangFromKey,
  formatToTabsOutput,
  formatToValidObj,
} from "../../../utils/Parameters/langParamsHelper";
import { defaultOptions, langs } from "../../../consts";
import { findNestedValue } from "../../../utils/findNestedValue";
import { ExclamationCircleTwoTone } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';

const items = Object.values(langs).map((lang) => ({
  key: lang,
  label: lang.toUpperCase(),
  children: (
    <Form.Item>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Form.Item name={`name_${lang}`} label="Name" labelAlign="left">
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
    </Form.Item>
  ),
}));

export const EditParameter = () => {
  const [parameter, setParameter] = useState();
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const { state } = useLocation();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();

  const getTypeName = () => {
    const foundOption = defaultOptions.find(
      (option) => option.key === parameter.type
    );
    if (foundOption) {
      const { label: type } = foundOption;
      return type;
    } else {
      message.error(`No option found for key ${parameter.type}`);
    }
  };

  const handleEditParameter = async (values) => {
    const names = extractLangFromKey(values, "name");
    const units = extractLangFromKey(values, "unit");
    const shortUnits = extractLangFromKey(values, "shortUnit");

    const formatedNames = formatToValidObj(names);
    const formatedUnits = formatToValidObj(units);
    const formatedShortUnits = formatToValidObj(shortUnits);

    try {
      const response = await editParameter(parameter.id, {
        variable_name: values.variable_name,
        name: formatedNames,
        unit: formatedUnits,
        short_unit: formatedShortUnits,
        type: parameter.type,
      });
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const confirmDelete = () => {
    modal.confirm({
      title: "Confirm the deletion",
      content: "Are you sure you want to delete the parameter?",
      type: "warning",
      onOk: () => handleDeleteParameter(),
      okText: "Delete parameter",
      cancelText: "Cancel",
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

  const handleDeleteParameter = async () => {
    try {
      const response = await removeParameter(state.id);
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleSetType = (type) => {
    const { key: neededType } = defaultOptions.find(
      (option) => option.value === type
    );
    setParameter((prev) => ({ ...prev, type: neededType }));
  };

  useEffect(() => {
    const fetchParameter = async () => {
      try {
        if (state) {
          setLoading(true);
          const response = await getParameter(state.id);
          if (response) {
            setParameter({
              id: response.id,
              type: response.type,
              variable_name: response.variable_name,
              ...formatToTabsOutput(response.name, "name"),
              ...formatToTabsOutput(response.unit, "unit"),
              ...formatToTabsOutput(response.short_unit, "shortUnit"),
            });
          }
          setLoading(false);
        }
      } catch (error) {
        const errorMsg = findNestedValue(error?.response?.data || null);
        message.error(errorMsg || error.message);
      }
      setLoading(false);
    };
    fetchParameter();
  }, []);

  if (parameter) {
    return (
      <>
        <PageHeader title={t("settings.parameters.edit.title", {parameter: state.name})} margin />
        <Form
          layout="vertical"
          size="large"
          onFinish={handleEditParameter}
          initialValues={{
            ...parameter,
            type: getTypeName(),
          }}
        >
          <Form.Item>
            <Flex justify="space-between" wrap>
              <Form.Item
                name="variable_name"
                label="Identifier"
                style={{ width: "45%" }}
              >
                <Input placeholder="Enter the identifier..." />
              </Form.Item>
              <Form.Item name="type" label="Type" style={{ width: "45%" }}>
                <Select options={defaultOptions} onSelect={handleSetType} />
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
            <h2>{t("settings.parameters.edit.locales")}</h2>

            <Tabs defaultActiveKey="1" items={items} type="card" />
          </Form.Item>
          <Form.Item>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                style={{ padding: "0 64px" }}
              >
                {t("buttons.save")}
              </Button>
              <Button
                type="primary"
                danger
                style={{ padding: "0 64px" }}
                onClick={confirmDelete}
              >
                {t("buttons.remove.default")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </>
    );
  } else return <Spin spinning={loading} fullscreen />;
};
