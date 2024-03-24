import { App, Flex, Form, Input, Table } from "antd";
import { colors } from "../consts";
import { CloseSquareFilled } from "@ant-design/icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const EvalFormulas = ({ param, conditions, onDelete, onUpdate }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const columns = useMemo(
    () => [
      {
        title: t("parameters.collapse.formulas.columns.condition"),
        dataIndex: "condition",
        key: "condition",
        width: "50%",
      },
      {
        title: t("parameters.collapse.formulas.columns.formula"),
        dataIndex: "formula",
        key: "formula",
        width: "50%",
      },
    ],
    []
  );

  const handleUpdateInput = (target, field, value) => {
    onUpdate((prev) =>
      prev.map((row) => {
        if (row.key === target) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  const createDefaultCondition = useMemo(
    () => (formula) => {
      const uniqueKey = "default";
      return {
        key: uniqueKey,
        condition: (
          <h4 style={{ color: colors.gray }}>
            {t("parameters.collapse.formulas.default_formula")}
          </h4>
        ),
        formula: (
          <Form.Item
            name={`${uniqueKey}_formula_${param.id}`}
            style={{ width: "100%", margin: 0 }}
            initialValue={formula}
            rules={[
              {
                validator: (_, value) => {
                  if (!value) {
                    message.error(
                      t("rules.formula", { parameter: param.label })
                    );
                    return Promise.reject(
                      t("rules.formula", { parameter: param.label })
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              onChange={(e) =>
                handleUpdateInput(uniqueKey, "formula", e.target.value)
              }
              style={{ backgroundColor: "white" }}
              placeholder={t("placeholders.formula")}
            />
          </Form.Item>
        ),
      };
    },
    []
  );

  const createConditionRow = useMemo(() => {
    return (uniqueKey, condition, formula) => {
      const conditionRow = {
        key: uniqueKey,
        condition: (
          <Form.Item
            name={`${uniqueKey}_condition_${param.id}`}
            style={{ width: "90%", margin: 0 }}
            initialValue={condition}
            rules={[
              {
                validator: (_, value) => {
                  if (!value) {
                    message.error(
                      t("rules.condition", {parameter: param.label})
                    );
                    return Promise.reject(
                      t("rules.condition", {parameter: param.label})
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              onChange={(e) =>
                handleUpdateInput(uniqueKey, "condition", e.target.value)
              }
              style={{ backgroundColor: "white" }}
              placeholder={t("placeholders.condition")}
            />
          </Form.Item>
        ),
        formula: (
          <Flex gap="large" align="start">
            <Form.Item
              name={`${uniqueKey}_formula_${param.id}`}
              style={{ width: "90%", margin: 0 }}
              initialValue={formula}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      message.error(
                       t("rules.formula", {parameter: param.label})
                      );
                      return Promise.reject(
                       t("rules.formula", {parameter: param.label})
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                value={formula}
                onChange={(e) =>
                  handleUpdateInput(uniqueKey, "formula", e.target.value)
                }
                style={{ backgroundColor: "white" }}
                placeholder={t("placeholders.formula")}
              />
            </Form.Item>
            <CloseSquareFilled
              onClick={() => onDelete(uniqueKey)}
              style={{ alignSelf: "center", fontSize: 32, color: colors.red }}
            />
          </Flex>
        ),
      };
      return conditionRow;
    };
  }, []);

  const tabItems =
    conditions.length > 1
      ? conditions
          // sorting to "default" be at 0 index
          .sort((a, b) => {
            if (a.condition === "default") {
              return -1;
            } else if (b.condition === "default") {
              return 1;
            }

            return 0;
          })
          // creating JSX conditions
          .map(({ key, condition, formula }) => {
            if (condition === "default") return createDefaultCondition(formula);
            return createConditionRow(key, condition, formula);
          })
      : conditions.length === 1
      ? [createDefaultCondition(conditions[0].formula)]
      : [createDefaultCondition()];

  return (
    <Table
      className={"borderedHeader"}
      columns={columns}
      dataSource={tabItems}
      pagination={false}
    />
  );
};
