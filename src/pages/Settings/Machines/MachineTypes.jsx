import { useState, useEffect, useMemo } from "react";
import { Button, Flex, Form, Input, Space, Tabs, message } from "antd";
import { CustomModal } from "../../../components/Modal/CustomModal";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StandartList } from "../../../components/UI/StandartList/StandartList";
import { langs } from "../../../consts";
import {
  createMachineType,
  editMachineType,
  getMachineTypes,
  removeMachineType,
} from "../../../http/machineTypeApi";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import {
  extractLangFromKey,
  formatToValidObj,
} from "../../../utils/Parameters/langParamsHelper";
import { findNestedValue } from "../../../utils/findNestedValue";
import { t } from "i18next";

export const MachineTypes = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [types, setTypes] = useState([]);

  const [selected, setSelected] = useState({});

  const currentLang = useSelector(selectCurrentLang);

  const showAddModal = () => {
    setOpenAdd(true);
  };
  const handleCreateType = async (values) => {
    const names = extractLangFromKey(values, "name");
    const formatedNames = formatToValidObj(names);

    try {
      const response = await createMachineType(formatedNames);
      if (response) setTypes((prev) => [response, ...prev]);
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
    setOpenAdd(false);
  };

  const handleAddClose = () => {
    setOpenAdd(false);
  };

  const handleSetTypes = (types) => {
    setTypes(types);
  };
  console.log(types);
  const showEditModal = (item) => {
    const neededItem = types.find((type) => type.id === item.key);
    setSelected({ id: neededItem.id, ...neededItem.name });
    setOpenEdit(true);
  };
  const handleEditSave = async ({ id, ...values }) => {
    try {
      const response = await editMachineType(id, values);
      if (response) {
        const prevTypes = [...types];
        const typeIndex = prevTypes.findIndex((type) => type.id === id);

        if (typeIndex !== -1) {
          const editedType = {
            id: id,
            name: values,
          };
          prevTypes[typeIndex] = editedType;
        }

        setTypes(prevTypes);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
    setOpenEdit(false);
  };

  const handleEditRemove = async () => {
    try {
      const response = await removeMachineType(selected.id);
      if (response)
        setTypes((prev) => prev.filter((type) => type.id !== selected.id));
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
    setOpenEdit(false);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const buttons = [{ name: t("buttons.add.type"), handler: showAddModal }];

  const editItems = Object.values(langs).map((lang) => ({
    key: lang,
    label: lang.toUpperCase(),
    children: (
      <Form.Item name={lang} label={t("labels.name")} labelAlign="left">
        <Input placeholder="The changes will affect all models that use this type" />
      </Form.Item>
    ),
  }));

  const addItems = Object.values(langs).map((lang) => ({
    key: lang,
    label: lang.toUpperCase(),
    children: (
      <Form.Item
        name={`name_${lang}`}
        label={t("labels.name")}
        labelAlign="left"
      >
        <Input placeholder={t("placeholders.name")} />
      </Form.Item>
    ),
  }));

  const machineTypes = useMemo(
    () =>
      types.map((type) => {
        const title = type.name[currentLang] || type.name.en;

        return {
          key: type.id,
          id: type.id,
          title: title,
        };
      }),
    [types]
  );

  const fetchMachineTypes = async () => {
    try {
      const response = await getMachineTypes();
      if (response) handleSetTypes(response.results);
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    fetchMachineTypes();
  }, [currentLang]);

  return (
    <>
      <CustomModal
        title={t("modals.machine_types.add.title")}
        open={openAdd}
        onClose={handleAddClose}
      >
        <Form
          layout="vertical"
          style={{ width: "100%" }}
          onFinish={handleCreateType}
        >
          <Tabs defaultActiveKey="1" items={addItems} type="card" />
          <Form.Item>
            <Flex align="center">
              <Button
                type="primary"
                block
                htmlType="submit"
                style={{ padding: "0 64px" }}
              >
                {t("buttons.create.default")}
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </CustomModal>

      <CustomModal
        title={t("modals.machine_types.edit.title")}
        open={openEdit}
        onClose={handleEditClose}
      >
        <Form
          layout="vertical"
          initialValues={selected}
          onFinish={handleEditSave}
        >
          <Tabs defaultActiveKey="1" items={editItems} type="card" />
          <Form.Item name="id">
            <Space>
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
                onClick={handleEditRemove}
                style={{ padding: "0 64px" }}
              >
                {t("buttons.remove.default")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </CustomModal>

      <PageHeader
        title={t("settings.machines.machine_types.title")}
        buttons={buttons}
        margin
      />
      <StandartList items={machineTypes} setSelected={showEditModal} />
    </>
  );
};
