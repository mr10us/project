import { Table, Input, Checkbox } from "antd";
import { Evaluation } from "./Evaluation";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export const EvalTable = ({ evaluations, handleInputs, handleCheckbox }) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        title: t("parameters.collapse.evaluations.columns.type"),
        dataIndex: "type",
        key: "type",
        align: "center",
      },
      {
        title: t("parameters.collapse.evaluations.columns.min"),
        dataIndex: "min",
        key: "min",
        align: "center",
      },
      {
        title: t("parameters.collapse.evaluations.columns.+min"),
        dataIndex: "include_min",
        key: "include_min",
        align: "center",
      },
      {
        title: t("parameters.collapse.evaluations.columns.max"),
        dataIndex: "max",
        key: "max",
        align: "center",
      },
      {
        title: t("parameters.collapse.evaluations.columns.+max"),
        dataIndex: "include_max",
        key: "include_max",
        align: "center",
      },
    ],
    []
  );

  const tabItems = useMemo(
    () =>
      Object.entries(evaluations).map(([evaluationKey, evaluationValues]) => ({
        key: evaluationKey,
        type: <Evaluation type={evaluationKey} size="extraLarge" />,
        min: (
          <Input
            value={evaluationValues.min.formula}
            onChange={(e) => handleInputs(evaluationKey, "min", e.target.value)}
            style={{ backgroundColor: "white" }}
            placeholder={t("placeholders.evaluation")}
          />
        ),
        include_min: (
          <Checkbox
            checked={evaluationValues.min.include}
            onChange={(e) =>
              handleCheckbox(evaluationKey, "min", e.target.checked)
            }
          />
        ),
        max: (
          <Input
            value={evaluationValues.max.formula}
            onChange={(e) => handleInputs(evaluationKey, "max", e.target.value)}
            style={{ backgroundColor: "white" }}
            placeholder={t("placeholders.evaluation")}
          />
        ),
        include_max: (
          <Checkbox
            checked={evaluationValues.max.include}
            onChange={(e) =>
              handleCheckbox(evaluationKey, "max", e.target.checked)
            }
          />
        ),
      })),
    [evaluations]
  );

  return (
    <Table
      className={"borderedHeader"}
      columns={columns}
      dataSource={tabItems}
      pagination={false}
    />
  );
};
