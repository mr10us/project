import { useEffect, useState } from "react";
import { Flex, Button, Form, Space, Select, App } from "antd";
import { ExclamationCircleTwoTone, PlusSquareFilled } from "@ant-design/icons";
import { StaticParamElement } from "./StaticParamElement/StaticParamElement";
import { CustomEmpty } from "./UI/CustomEmpty";
import { colors } from "../consts";
import { CustomModal } from "./Modal/CustomModal";
import { useTranslation } from "react-i18next";

export const StaticParameters = ({
  params,
  onChange,
  noDelete,
  searchParams,
}) => {
  const [staticParams, setStaticParams] = useState(params || []);

  const [open, setOpen] = useState(false);

  const { modal } = App.useApp();
  const { t } = useTranslation();

  const emptyArray =
    staticParams?.length === undefined || staticParams.length === 0;

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const confirmDelete = (toDelete) => {
    modal.confirm({
      title: t("messages.confirm.deletion.parameter.title"),
      content: t("messages.confirm.deletion.parameter.content"),
      type: "warning",
      onOk: () => deleteParameter(toDelete),
      okText: t("messages.confirm.deletion.parameter.ok_text"),
      cancelText: t("messages.confirm.deletion.parameter.cancel_text"),
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
    setStaticParams((staticParams) =>
      staticParams.filter((item) => item.id !== toDelete)
    );
  };

  const handleAddParameter = ({ parameter }) => {
    if (parameter) {
      const param = searchParams.find((item) => item.value === parameter);
      setStaticParams((staticParams) => [
        { ...param, label: param.label, value: "", id: param.value },
        ...staticParams,
      ]);
    }
    handleClose();
  };

  const handleStaticParamChange = (paramName, paramValue) => {
    setStaticParams(
      (prev) =>
        !emptyArray &&
        prev.map((item) =>
          item.label === paramName ? { ...item, value: paramValue } : item
        )
    );
  };

  useEffect(() => {
    onChange(staticParams);
  }, [staticParams]);

  return (
    <>
      {!noDelete && (
        <CustomModal
          title={t("parameters.modal.name")}
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
        <h2>{t("parameters.static.name")}</h2>
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
        staticParams.map((item, idx) => (
          <Form.Item key={idx}>
            <StaticParamElement
              paramName={item.label}
              isOverrided={item.isOverrided}
              paramID={item.id}
              paramValue={item.value}
              onChange={handleStaticParamChange}
              onDelete={confirmDelete}
              noDelete={noDelete}
            />
          </Form.Item>
        ))
      )}
    </>
  );
};
