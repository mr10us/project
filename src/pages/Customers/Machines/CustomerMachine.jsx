import { Flex, Form, Badge, Button, Input, Space, App } from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { Search } from "../../../components/UI/Search/Search";
import { useLocation, useNavigate } from "react-router-dom";
import { EditFilled, ExclamationCircleTwoTone } from "@ant-design/icons";
import { roles, routes } from "../../../consts";
import { useEffect, useState } from "react";
import {
  editCustomerMachine,
  getCustomerMachine,
  removeCustomerMachine,
} from "../../../http/customerMachinesApi";
import { getMachineModels } from "../../../http/machineModelsApi";
import { getCuttingFluids } from "../../../http/cuttingFluidApi";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { ROCustomerMachine } from "../../../components/ReadOnlyPages/ROCustomerMachine";
import { useGetPermissions } from "../../../hooks/useGetParmissions";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";
import { findNestedValue } from "../../../utils/findNestedValue";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";

export const CustomerMachine = () => {
  const { t } = useTranslation();

  const [customerMachine, setCustomerMachine] = useState({
    customerID: -1,
    machineName: "",
    model: {},
    cuttingFluid: {},
    activeStatus: true,
    overridedCFParams: false,
    overridedModelParams: false,
  });
  const [selectedCustomerParams, setSelectedCustomerParams] = useState({
    model: {},
    cuttingFluid: {},
    activeStatus: true,
  });
  const [fetchedCustomerOptions, setFetchedCustomerOptions] = useState({
    models: [],
    cuttingFluids: [],
    statuses: [
      { label: t("statuses.active"), value: "active" },
      { label: t("statuses.inactive"), value: "inactive" },
    ],
  });
  const { role } = useGetPermissions();
  const { width } = useGetCurrentSize();
  const customerID = useGetCustomerID();
  const navigate = useNavigate();
  const machineData =
    useLocation()?.state || JSON.parse(localStorage.getItem("mach"));
  const { message, modal } = App.useApp();
  const isMobile = width < 565;
  const UXsize = isMobile ? "middle" : "large"

  const isOverridedModel = customerMachine.overridedModelParams;
  const isOverridedCF = customerMachine.overridedCFParams;

  const handleSetCustomerID = (customerID) => {
    setCustomerMachine((prev) => ({ ...prev, customerID: customerID }));
  };
  const handleSetCustomerMachineName = (machineName) => {
    setCustomerMachine((prev) => ({ ...prev, machineName: machineName }));
  };
  const handleSetCustomerModel = (model) => {
    setCustomerMachine((prev) => ({ ...prev, model: model }));
  };
  const handleSetCustomerCuttingFluid = (cuttingFluid) => {
    setCustomerMachine((prev) => ({ ...prev, cuttingFluid: cuttingFluid }));
  };
  const handleSetCustomerStatus = (status) => {
    setCustomerMachine((prev) => ({ ...prev, activeStatus: status }));
  };
  const handleSetCustomerOverridedModelParams = (isOverrided) => {
    setCustomerMachine((prev) => ({
      ...prev,
      overridedModelParams: isOverrided,
    }));
  };
  const handleSetCustomerOverridedCFParams = (isOverrided) => {
    setCustomerMachine((prev) => ({ ...prev, overridedCFParams: isOverrided }));
  };

  const handleSelectModel = (modelID) => {
    setSelectedCustomerParams((prev) => ({ ...prev, model: { id: modelID } }));
  };
  const handleSelectCF = (cfID) => {
    setSelectedCustomerParams((prev) => ({
      ...prev,
      cuttingFluid: { id: cfID },
    }));
  };
  const handleSelectStatus = (status) => {
    setSelectedCustomerParams((prev) => ({
      ...prev,
      status: status.toLowerCase() === "active",
    }));
  };

  const handleFetchMachineModels = (machineModels) => {
    setFetchedCustomerOptions((prev) => ({
      ...prev,
      models: machineModels.map((model) => ({
        label: model.name,
        value: model.id,
      })),
    }));
  };
  const handleFetchCFs = (cuttingFluids) => {
    setFetchedCustomerOptions((prev) => ({
      ...prev,
      cuttingFluids: cuttingFluids.map((cf) => ({
        label: cf.name,
        value: cf.id,
      })),
    }));
  };

  const { isLoading, isSuccess, isError, error, remove, refetch } = useQuery(
    "customerMachine",
    () => getCustomerMachine(customerID, machineData.machineID),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        handleSetCustomerID(data.internal_number);
        handleSetCustomerMachineName(data.customer.name);
        handleSetCustomerModel(data.model);
        handleSetCustomerCuttingFluid(data.cutting_fluid_model);
        handleSetCustomerStatus(data.is_active);
        handleSetCustomerOverridedModelParams(
          data.override_model_parameters.length > 0
        );
        handleSetCustomerOverridedCFParams(
          data.override_cf_parameters.length > 0
        );
      },
      onError: (error) => {
        const errorMsg = findNestedValue(error?.response?.data || null);
        message.error(errorMsg || error.message);
      },
    }
  );

  const fetchMachineModels = async (query) => {
    try {
      const response = await getMachineModels(query);
      if (response) {
        handleFetchMachineModels(response.results);
        if (response.next)
          await fetchMachineModels(`${response.next.split("?")[1]}`);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };
  const fetchCuttingFluids = async (query) => {
    try {
      const response = await getCuttingFluids(query);
      if (response) {
        handleFetchCFs(response.results);
        if (response.next)
          await fetchMachineModels(`${response.next.split("?")[1]}`);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleSaveCustomerMachine = async ({ customer }) => {
    try {
      const response = await editCustomerMachine(
        machineData.machineID,
        selectedCustomerParams.model.id,
        selectedCustomerParams.cuttingFluid.id || null,
        customer || "",
        selectedCustomerParams.status
      );

      if (response) {
        message.success("Changes saved!");
        refetch();
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const confirmDelete = () => {
    modal.confirm({
      title: "Confirm the deletion",
      content: "Are you sure you want to delete the machine?",
      type: "warning",
      onOk: handleRemoveCustomerMachine,
      okText: "Delete",
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
  const handleRemoveCustomerMachine = async () => {
    try {
      const response = await removeCustomerMachine(machineData.machineID);
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    fetchMachineModels();
    fetchCuttingFluids();
    return () => remove();
  }, []);

  useEffect(() => {
    if (machineData?.id)
      localStorage.setItem("mach", JSON.stringify(machineData));
  }, [machineData]);

  if (role !== roles.admin.toLowerCase())
    return <ROCustomerMachine customerMachine={customerMachine} />;

  return (
    <>
      <PageHeader title={t("customer.machines.machine.title")} margin />

      {isLoading && <Loader />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && customerMachine.machineName && (
        <Form
          layout="vertical"
          size={UXsize}
          initialValues={{ customer: customerMachine.customerID }}
          onFinish={handleSaveCustomerMachine}
        >
          <Flex
            align="center"
            gap={width < 425 ? 0 : "large"}
            wrap={width < 425 ? "wrap" : ""}
          >
            <Form.Item
              name="customer"
              label={t("labels.customer_id")}
              style={{ width: width < 475 ? "100%" : "50%" }}
            >
              <Input placeholder={t("placeholders.customer_id")} />
            </Form.Item>
            <Flex
              align="end"
              gap={isMobile ? null : "large"}
              style={{ width: width < 475 ? "100%" : "50%" }}
              justify="space-between"
              wrap={isMobile ? "wrap" : "nowrap"}
            >
              <Form.Item label={t("labels.model")} style={{ width: "100%" }}>
                <Search
                  defaultValue={
                    customerMachine.model?.name && {
                      label: customerMachine.model.name,
                      value: customerMachine.model.id,
                    }
                  }
                  options={fetchedCustomerOptions.models}
                  handleSelect={handleSelectModel}
                />
              </Form.Item>
              <Form.Item style={{ width: "fit-content" }}>
                {customerMachine.model?.name ? (
                  isOverridedModel ? (
                    <Badge dot style={{ top: -12, padding: 5 }}>
                      <Button
                        type="primary"
                        onClick={() => {
                          navigate(routes.EDITCUSTOMERMACHINEMODEL, {
                            state: machineData,
                          });
                        }}
                      >
                        <EditFilled />
                        {t("buttons.edit")}
                      </Button>
                    </Badge>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => {
                        navigate(routes.EDITCUSTOMERMACHINEMODEL, {
                          state: machineData,
                        });
                      }}
                    >
                      <EditFilled />
                      {t("buttons.edit")}
                    </Button>
                  )
                ) : (
                  <Button type="submit" disabled>
                    <EditFilled />
                    {t("buttons.edit")}
                  </Button>
                )}
              </Form.Item>
            </Flex>
          </Flex>

          <Flex
            align="center"
            gap={width < 425 ? 0 : "large"}
            wrap={width < 425 ? "wrap" : ""}
          >
            <Form.Item
              label={t("labels.status")}
              style={{ width: width < 475 ? "100%" : "50%" }}
            >
              <Search
                defaultValue={
                  customerMachine.activeStatus
                    ? { label: t("statuses.active"), value: "active" }
                    : { label: t("statuses.inactive"), value: "inactive" }
                }
                options={fetchedCustomerOptions.statuses}
                handleSelect={handleSelectStatus}
              />
            </Form.Item>
            <Flex
              align="end"
              gap={isMobile ? null : "large"}
              style={{ width: width < 475 ? "100%" : "50%" }}
              justify="space-between"
              wrap={isMobile ? "wrap" : "nowrap"}
            >
              <Form.Item label={t("labels.cf")} style={{ width: "100%" }}>
                <Search
                  allowClear
                  defaultValue={
                    customerMachine.cuttingFluid?.name && {
                      label: customerMachine.cuttingFluid.name,
                      value: customerMachine.cuttingFluid.id,
                    }
                  }
                  options={fetchedCustomerOptions.cuttingFluids}
                  handleSelect={handleSelectCF}
                />
              </Form.Item>
              <Form.Item style={{ width: "fit-content" }}>
                {customerMachine.cuttingFluid?.name ? (
                  isOverridedCF ? (
                    <Badge dot style={{ top: -12, padding: 5 }}>
                      <Button
                        type="primary"
                        onClick={() => {
                          navigate(routes.EDITCUSTOMERCF, {
                            state: machineData,
                          });
                        }}
                      >
                        <EditFilled />
                        {t("buttons.edit")}
                      </Button>
                    </Badge>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => {
                        navigate(routes.EDITCUSTOMERCF, {
                          state: machineData,
                        });
                      }}
                    >
                      <EditFilled />
                      {t("buttons.edit")}
                    </Button>
                  )
                ) : (
                  <Button type="primary" disabled>
                    <EditFilled />
                    {t("buttons.edit")}
                  </Button>
                )}
              </Form.Item>
            </Flex>
          </Flex>

          <Form.Item style={{marginTop: 20}}>
            <Flex gap={width < 425 ? "middle" : "large"} wrap="wrap">
              <Button
                type="primary"
                htmlType="submit"
                style={{ padding: width < 425 ? "0 24px" : "0 42px" }}
              >
                {t("buttons.save")}
              </Button>
              <Button
                type="primary"
                style={{ padding: width < 425 ? "0 24px" : "0 42px" }}
                danger
                onClick={confirmDelete}
              >
                {t("buttons.remove.default")}
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      )}
    </>
  );
};
