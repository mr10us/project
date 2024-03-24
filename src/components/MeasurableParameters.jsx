import { useEffect, useState } from "react";
import { Flex, Button, Form, Space, Select, App } from "antd";
import { ExclamationCircleTwoTone, PlusSquareFilled } from "@ant-design/icons";
import { CustomEmpty } from "./UI/CustomEmpty";
import { colors } from "../consts";
import { CustomModal } from "./Modal/CustomModal";
import { EvalParamElement } from "./EvalParamElement";
import { useTranslation } from 'react-i18next';

const filterOption = (input, option) =>
  (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

export const MeasurableParameters = ({
  params,
  onChange,
  noDelete,
  searchParams,
}) => {
  const [measurableParams, setMeasurableParams] = useState(params);
  const [open, setOpen] = useState(false);
  const emptyArray =
    measurableParams?.length === undefined || measurableParams?.length === 0;

  const { modal } = App.useApp();
  const { t } = useTranslation();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const confirmDelete = (toDelete) => {
    modal.confirm({
      title: "Confirm the deletion",
      content: "Are you sure you want to delete the parameter?",
      type: "warning",
      onOk: () => deleteParameter(toDelete),
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

  const deleteParameter = (toDelete) => {
    setMeasurableParams((prev) =>
      prev.filter((item) => item.param.id !== toDelete)
    );
  };

  const handleAddParameter = ({parameter: parameterID}) => {
    if (parameterID) {
      const parameter = searchParams.find(
        (item) => item.value === parameterID
      );
      setMeasurableParams((prev) => [
        { param: { label: parameter.label, id: parameter.value } },
        ...prev,
      ]);
    }
    handleClose();
  };

  const handleEvalChange = (parameter) => {
    setMeasurableParams((prevParams) =>
      prevParams.map((item) =>
        item.param.id === parameter.param.id ? { ...parameter } : item
      )
    );
  };

  const handleChange = () => {
    const formatEvals = measurableParams.map((item) => {
      return {
        ...item,
        evaluations: item?.evaluations || {},
      };
    });

    onChange(formatEvals);
  };

  useEffect(() => {
    handleChange();
  }, [measurableParams]);

  return (
    <>
      {!noDelete && (
        <CustomModal title={t("parameters.modal.name")} open={open} onClose={handleClose}>
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
                options={searchParams}
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
      )}

      <Flex justify="space-between" style={{ marginBottom: 20 }}>
        <h2>{t("parameters.measurable.name")}</h2>
        {!noDelete && (
          <Button
            type="link"
            icon={<PlusSquareFilled style={{ fontSize: 24 }} />}
            className="addBtn"
            onClick={handleOpen}
          >
            {t("buttons.add.parameter")}
          </Button>
        )}
      </Flex>
      {emptyArray ? (
        <CustomEmpty
          style={{
            backgroundColor: colors.lightGray,
            padding: "36px 0",
            borderRadius: 12,
          }}
        />
      ) : (
        measurableParams.map((item) => (
          <Form.Item key={item.param.id}>
            <EvalParamElement
              onEvalChange={handleEvalChange}
              param={item.param}
              isOverrided={item.isOverrided}
              evaluations={item.evaluations}
              onDelete={confirmDelete}
              noDelete={noDelete}
            />
          </Form.Item>
        ))
      )}
    </>
  );
};
