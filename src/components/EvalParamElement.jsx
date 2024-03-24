import { useState, useEffect } from "react";
import {
  Collapse,
  ConfigProvider,
  Flex,
  Button,
  Badge,
  Tabs,
  Space,
} from "antd";
import { CloseSquareFilled, PlusOutlined } from "@ant-design/icons";
import { colors, initialEvals } from "../consts";
import { EvalTable } from "./EvalTable";
import { EvalFormulas } from "./EvalFormulas";
import { evalsArrToObj } from "../utils/Parameters/evalsArrToObj";
import { v4 as uuidv4 } from "uuid";
import { conditionsObjToArr } from "../utils/Parameters/conditionsObjToArr";
import { useTranslation } from 'react-i18next';

export const EvalParamElement = ({
  param,
  evaluations,
  conditions,
  isCalc,
  isOverrided,
  onEvalChange,
  onDelete,
  noDelete,
}) => {
  const [evaluationsObj, setEvaluationsObj] = useState(
    evaluations || evalsArrToObj(initialEvals)
  );

  const [conditionsArray, setConditionsArray] = useState(
    Array.isArray(conditions) ? conditions : conditionsObjToArr(conditions)
  );

  const [activeKey, setActiveKey] = useState("1");

  const { t } = useTranslation();

  const handleTabChange = (key) => {
    setActiveKey(key);
  }

  const handleAddCondition = () => {
    setActiveKey("1")
    const uniqueKey = uuidv4();

    setConditionsArray((prev) => [
      ...prev,
      { key: uniqueKey, condition: "", formula: "" },
    ]);
  };

  const handleDeleteCondition = (conditionIndex) => {
    setConditionsArray((prev) =>
      prev.filter((item) => item.key !== conditionIndex)
    );
  };

  const handleInputChange = (level, field, value) => {
    if (value.includes(",")) value = value.replace(",", ".");
    setEvaluationsObj((prevEvals) => ({
      ...prevEvals,
      [level]: {
        ...prevEvals[level],
        [field]: { ...prevEvals[level][field], formula: value },
      },
    }));
  };

  const handleCheckboxChange = (level, field, checked) => {
    setEvaluationsObj((prevEvals) => ({
      ...prevEvals,
      [level]: {
        ...prevEvals[level],
        [field]: { ...prevEvals[level][field], include: checked },
      },
    }));
  };

  useEffect(() => {
    onEvalChange(
      isCalc
        ? { param, evaluations: evaluationsObj, conditionsArray, isOverrided }
        : { param, evaluations: evaluationsObj, isOverrided }
    );
  }, [evaluationsObj, conditionsArray]);

  const tabs = [
    {
      key: "1",
      label: t("parameters.collapse.formulas.name"),
      children: (
        <EvalFormulas
          param={param}
          conditions={conditionsArray}
          onDelete={handleDeleteCondition}
          onUpdate={setConditionsArray}
        />
      ),
    },
    {
      key: "2",
      label: t("parameters.collapse.evaluations.name"),
      children: (
        <EvalTable
          evaluations={evaluationsObj}
          handleInputs={handleInputChange}
          handleCheckbox={handleCheckboxChange}
        />
      ),
    },
  ];

  const items = [
    {
      label: param.label,
      children: isCalc ? (
        <Tabs
          activeKey={activeKey}
          items={tabs}
          onChange={handleTabChange}
          tabBarExtraContent={{
            right: (
              <Space>
                <p style={{ color: colors.gray, marginRight: 10 }}>
                  {t("buttons.add.formula")}
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddCondition}
                />
              </Space>
            ),
          }}
        />
      ) : (
        <EvalTable
          evaluations={evaluationsObj}
          handleInputs={handleInputChange}
          handleCheckbox={handleCheckboxChange}
        />
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerBg: colors.lightBlue,
          },
          Table: {
            headerBg: "#76abdf",
            headerColor: "white",
            bodySortBg: "transparent",
          },
          Tabs: {
            itemColor: colors.gray,
          },
        },
        token: {
          colorBgContainer: "transparent",
        },
      }}
    >
      <Flex gap={15}>
        {isOverrided ? (
          <>
            <Collapse
              items={items}
              expandIconPosition="end"
              bordered={false}
              style={{ width: "100%", fontWeight: 500 }}
            />
            <Badge dot style={{ padding: 6 }} />
          </>
        ) : (
          <Collapse
            items={items}
            expandIconPosition="end"
            bordered={false}
            style={{ width: "100%", fontWeight: 500 }}
          />
        )}
        {!noDelete && (
          <Button
            icon={<CloseSquareFilled style={{ fontSize: 32 }} />}
            type="link"
            onClick={() => onDelete(param.id)}
            danger
            style={{ height: 57 }}
          />
        )}
      </Flex>
    </ConfigProvider>
  );
};
