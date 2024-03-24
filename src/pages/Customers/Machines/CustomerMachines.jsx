import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Flex,
  Form,
  Input,
  Button,
  App,
  Select,
  Table,
  Switch,
  Space,
} from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StandartFilter } from "../../../components/UI/Filters/StandartFilter/StandartFilter";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuOutlined, RetweetOutlined } from "@ant-design/icons";
import { CustomModal } from "../../../components/Modal/CustomModal";
import {
  createCustomerMachine,
  getCustomerMachines,
} from "../../../http/customerMachinesApi";
import { getMachineModels } from "../../../http/machineModelsApi";
import { useSelector } from "react-redux";
import { selectCustomerID } from "../../../features/Customer/customer";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";
import { roles } from "../../../consts";
import { ROCustomerMachines } from "../../../components/ReadOnlyPages/ROCustomerMachines";
import { useGetPermissions } from "../../../hooks/useGetParmissions";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";
import { findNestedValue } from "../../../utils/findNestedValue";
import {
  DndContext,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { reorderMachines } from "../../../http/customersApi";
import { useTranslation } from "react-i18next";

const Row = ({ children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"],
  });
  const style = {
    ...props.style,
    transform: CSS.Transform.toString(
      transform && {
        ...transform,
        scaleY: 1,
      }
    ),
    transition,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 999,
        }
      : {}),
  };
  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (child.key === "sort") {
          return React.cloneElement(child, {
            children: (
              <MenuOutlined
                ref={setActivatorNodeRef}
                style={{
                  touchAction: "none",
                  cursor: "move",
                }}
                {...listeners}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

export const CustomerMachines = () => {
  const [openModal, setOpenModal] = useState(false);

  const [query, setQuery] = useState("");
  const [customerMachines, setCustomerMachines] = useState([]);

  const [allowRearange, setAllowRearange] = useState(false);

  const queryClient = useQueryClient();
  const customerID = useSelector(selectCustomerID);
  const { role } = useGetPermissions();
  const { width } = useGetCurrentSize();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleOpen = () => {
    setOpenModal(true);
  };
  const handleClose = () => {
    setOpenModal(false);
  };

  const toggleRearange = () => {
    setAllowRearange((prev) => !prev);
  };

  const handleRearangeMachines = (machines) => {
    setCustomerMachines(
      machines.map((machine, index) => ({ ...machine, index: index + 1 }))
    );
    setTimeout(
      () =>
        mutateRearange(
          machines.map((machine, index) => ({
            id: machine.machineID,
            ordinal_number: index + 1,
          }))
        ),
      500
    );
  };

  const columns = useMemo(
    () =>
      allowRearange
        ? [
            {
              key: "sort",
              width: 20,
            },
            {
              title: "#",
              dataIndex: "index",
              key: "index",
            },
            {
              title: t("customer.machines.columns.customer_id"),
              dataIndex: "id",
              key: "id",
            },
            {
              title: t("customer.machines.columns.brand"),
              dataIndex: "brand",
              key: "brand",
            },
            {
              title: t("customer.machines.columns.model"),
              dataIndex: "model",
              key: "model",
            },
          ]
        : [
            {
              title: "#",
              dataIndex: "index",
              key: "index",
            },
            {
              title: t("customer.machines.columns.customer_id"),
              dataIndex: "id",
              key: "id",
            },
            {
              title: t("customer.machines.columns.brand"),
              dataIndex: "brand",
              key: "brand",
            },
            {
              title: t("customer.machines.columns.model"),
              dataIndex: "model",
              key: "model",
            },
          ],
    [allowRearange]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const activeIndex = customerMachines.findIndex(
        (i) => i.index === active.id
      );
      const overIndex = customerMachines.findIndex((i) => i.index === over?.id);

      const newOrder = arrayMove(customerMachines, activeIndex, overIndex);

      handleRearangeMachines(newOrder);
    }
  };

  const handleSetCustomerMachines = (machines) => {
    setCustomerMachines(
      machines.map((machine, idx) => ({
        index: idx + 1,
        id: machine.internal_number,
        machineID: machine.id,
        key: machine.internal_number,
        model: machine.model.name,
        brand: machine.model.brand.name,
        link: `${machine.id}/`,
      }))
    );
  };

  const handleCreateMachine = async ({ internalNumber, modelID }) => {
    try {
      const response = await createCustomerMachine(
        customerID,
        modelID,
        null,
        customerMachines.length + 1,
        internalNumber
      );
      if (response) {
        queryClient.invalidateQueries(["customerMachines"]);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
    handleClose();
  };

  const {
    isLoading: isLoadingCustomerMachine,
    isError: isErrorCustomerMachine,
    error: errorCustomerMachine,
    isSuccess: isSuccesCustomerMachine,
    remove: removeCustomerMachine,
  } = useQuery(
    ["customerMachines", query],
    () => getCustomerMachines(customerID, query),
    {
      onSuccess: (data) => {
        handleSetCustomerMachines(data.results);
      },
    }
  );

  const {
    isLoading: isLoadingMachineModels,
    isError: isErrorMachineModels,
    error: errorMachineModels,
    isSuccess: isSuccesMachineModels,
    data: dataMachineModels,
    remove: removeMachineModels,
  } = useQuery("customerMachineModels", () =>
    getMachineModels(`customer_id=${customerID}`)
  );
  const machineModels = useMemo(
    () => (isSuccesMachineModels ? dataMachineModels.results : []),
    [isSuccesMachineModels, dataMachineModels]
  );

  const {
    isLoading: isLoadingRearange,
    isError: isErrorRearange,
    error: errorRearange,
    isSuccess: isSuccessRearange,
    mutate: mutateRearange,
  } = useMutation(
    (newOrder) => {
      return reorderMachines(customerID, newOrder);
    },
    {
      onSuccess: () => message.success("Machine order changed successfuly"),
      onError: (error) => {
        message.error(error.message);
      },
    }
  );

  const filterItems = useMemo(
    () =>
      [
        {
          key: "order by",
          label: t("filter.by.order"),
          type: "ordering",
          children: (
            <StandartFilter.Radio
              buttons={[
                { value: "+number", name: t("filter.options.+number") },
                { value: "-number", name: t("filter.options.-number") },
                { value: "+id", name: t("filter.options.+customer") },
                { value: "-id", name: t("filter.options.-customer") },
                { value: "+model", name: t("filter.options.+model") },
                { value: "-model", name: t("filter.options.-model") },
              ]}
            />
          ),
        },
        {
          key: "status",
          label: t("filter.by.status"),
          type: "is_active",
          children: (
            <StandartFilter.Radio
              buttons={[
                { value: true, name: t("filter.options.active") },
                { value: false, name: t("filter.options.inactive") },
                { value: "all", name: t("filter.options.all") },
              ]}
            />
          ),
        },
        isSuccesMachineModels && {
          key: "models",
          label: t("filter.by.models"),
          type: "model",
          children: (
            <StandartFilter.Checkbox
              buttons={
                machineModels.length > 0
                  ? machineModels.map((model) => ({
                      value: model.id,
                      children: <p>{model.name}</p>,
                    }))
                  : []
              }
            />
          ),
        },
      ].filter(Boolean),
    [isSuccesMachineModels]
  );

  const handlePagination = useCallback((currentPage) => {
    if (currentPage % 10 === 0) {
      data.next && setQuery(data.next.split("?")[1]);
    }
  }, []);

  useEffect(() => {
    return () => {
      removeCustomerMachine();
      removeMachineModels();
    };
  }, []);

  if (role !== roles.admin.toLowerCase()) {
    return (
      <ROCustomerMachines
        isLoading={isLoadingCustomerMachine}
        isError={isErrorCustomerMachine}
        error={errorCustomerMachine}
        isSuccess={isSuccesCustomerMachine}
        items={customerMachines.map((machine) => {
          const { link, ...rest } = machine;
          return rest;
        })}
        columns={columns}
        filterItems={filterItems}
        setQuery={setQuery}
        handlePagination={handlePagination}
      />
    );
  }

  return (
    <>
      <CustomModal
        title={t("buttons.add.machine")}
        open={openModal}
        onClose={handleClose}
      >
        <Form
          layout="vertical"
          style={{ width: "70%" }}
          onFinish={handleCreateMachine}
        >
          <Form.Item
            name="internalNumber"
            label={t("labels.customer_id")}
            rules={[
              { required: true, message: t("rules.customer_id") },
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }

                  const exists = customerMachines.some(
                    (model) => model.id === parseInt(value)
                  );
                  if (exists) {
                    return Promise.reject(t("rules.valid.customer_id"));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder={t("placeholders.customer_id")} />
          </Form.Item>
          <Form.Item
            name={"modelID"}
            label={t("labels.model")}
            rules={[{ required: true, message: t("rules.model") }]}
          >
            <Select
              placeholder={t("placeholders.model")}
              showSearch
              allowClear
              filterOption={(input, option) =>
                (option?.children.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
            >
              {machineModels.map((model) => (
                <Select.Option key={model.id} value={model.id}>
                  {`${model.brand.name} ${model.name}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" block htmlType="submit">
              {t("buttons.add.default")}
            </Button>
          </Form.Item>
        </Form>
      </CustomModal>

      <PageHeader
        size={"large"}
        title={t("customer.machines.name")}
        buttons={[{ name: t("buttons.add.machine"), handler: handleOpen }]}
        margin
      />
      <Space size="small" style={{ fontSize: "1em", marginBottom: 40 }}>
        <Switch
          checked={allowRearange}
          loading={isLoadingRearange}
          onChange={toggleRearange}
        />
        <p
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={toggleRearange}
        >
          {t("customer.machines.rearange")}
        </p>
      </Space>
      {/* <Search
        hint="You can search for machines by model name, customer ID"
        options={customerMachineSearchItems || []}
        suffix
        style={{ width: 300 }}
      /> */}
      <Flex
        gap="large"
        justify="space-between"
        style={width < 1000 ? { flexDirection: "column-reverse" } : {}}
      >
        <div style={width < 1000 ? { width: "100%" } : { width: "70%" }}>
          {isLoadingCustomerMachine && <Loader />}
          {isErrorCustomerMachine && (
            <Error errorMsg={errorCustomerMachine.message} />
          )}

          {isSuccesCustomerMachine && (
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={onDragEnd}
              sensors={sensors}
            >
              <SortableContext
                // rowKey array
                items={customerMachines.map((i) => i.index)}
                strategy={verticalListSortingStrategy}
              >
                <Table
                  components={{
                    body: {
                      row: Row,
                    },
                  }}
                  rowKey="index"
                  columns={columns}
                  size={width < 465 ? "small" : "large"}
                  dataSource={customerMachines}
                  pagination={false}
                  rowClassName={
                    customerMachines && customerMachines[0]?.link
                      ? "table-row-cursor-pointer"
                      : ""
                  }
                  onRow={(item) => ({
                    onClick: () => navigate(item.link, { state: item }),
                  })}
                />
              </SortableContext>
            </DndContext>
          )}
        </div>
        <div style={width < 1000 ? { width: "100%" } : { width: "30%" }}>
          <StandartFilter
            filterItems={filterItems}
            setQuery={setQuery}
            collapseSize={1000}
          />
        </div>
      </Flex>
    </>
  );
};
