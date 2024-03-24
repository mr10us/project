import { useState, useEffect, useMemo } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Button,
  Flex,
  Form,
  Input,
  Space,
  Badge,
  Popconfirm,
  App,
  Select,
} from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { colors, roles, routes } from "../../../consts";
import { EditFilled, ExclamationCircleTwoTone } from "@ant-design/icons";
import { DisplayedParameters } from "../../../components/DisplayedParameters/DisplayedParameters";
import { useGetCurrentPage } from "../../../hooks/useGetCurrentPage";
import {
  editCustomer,
  getCustomerLite,
  removeCustomer,
} from "../../../http/customersApi";
import { getParameters } from "../../../http/parametersApi";
import { getMixers } from "../../../http/mixersApi";
import { getCuttingFluids } from "../../../http/cuttingFluidApi.js";
import { useSelector } from "react-redux";
import { selectCustomerID } from "../../../features/Customer/customer";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { sortOrdinal } from "../../../utils/sortOrdinal";
import { ROSettings } from "../../../components/ReadOnlyPages/ROSettings.jsx";
import { useGetPermissions } from "../../../hooks/useGetParmissions.js";
import { useInfiniteQuery, useQuery } from "react-query";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper.js";
import { Loader } from "../../../components/Loader.jsx";
import { Error } from "../../../components/Error.jsx";
import { AbstractParamWidget } from "../../../components/AbstractParamWidget.jsx";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize.js";
import { findNestedValue } from "../../../utils/findNestedValue.js";
import { useTranslation } from "react-i18next";

export const Settings = () => {
  const { t } = useTranslation();

  const [customer, setCustomer] = useState({
    id: -1,
    name: "",
    mixer: {},
    cuttingFluid: {},
    activeStatus: true,
    displayedParameters: [],
    newDisplayedParameters: [],
    abstractParameters: [],
    overridedMixerParams: false,
    overridedCFParams: false,
  });
  const [fetchedCustomerOptions, setFetchedCustomerOptions] = useState({
    parameters: [],
    mixers: [],
    cuttingFluids: [],
    statuses: [
      { label: t("filter.options.inactive"), value: "inactive" },
      { label: t("filter.options.active"), value: "active" },
    ],
  });
  const [selectedCustomerParams, setSelectedCustomerParams] = useState({
    mixer: {},
    cuttingFluid: {},
    isActive: false,
  });

  const customerID = useSelector(selectCustomerID);
  const currentLang = useSelector(selectCurrentLang);
  const permissions = useGetPermissions();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const { width } = useGetCurrentSize();

  const isMobile = width < 565;
  const UXsize = isMobile ? "middle" : "large";
  const UXpadSize = isMobile ? "8px 12px" : "12px 24px";
  const UXrad = isMobile ? 6 : 8;

  const isOverridedMixer = customer?.overridedMixerParams;
  const isOverridedCF = customer?.overridedCFParams;

  const confirmDelete = (parameterID) => {
    modal.confirm({
      title: "Confirm the deletion",
      content: "Are you sure you want to delete the parameter?",
      type: "warning",
      onOk: () => handleDeleteDisplayedParameter(parameterID),
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
  const handleDeleteDisplayedParameter = (parameterID) => {
    const filteredParams = customer.displayedParameters.filter(
      (item) => item.parameter.id !== parameterID
    );
    const sortedParams = sortOrdinal(filteredParams);

    setCustomer((prev) => ({
      ...prev,
      displayedParameters: sortedParams,
    }));
  };
  const handleCheckedDisplayedParameters = (parameterID, checked) => {
    setCustomer((prev) => ({
      ...prev,
      displayedParameters: prev.displayedParameters.map((item) =>
        item.parameter.id === parameterID
          ? { ...item, is_statistical: checked }
          : item
      ),
    }));
  };
  const handleReorderDisplayedParams = (newArray) => {
    const newOrder = newArray.map((param, index) => ({
      ...param,
      ordinal_number: index + 1,
    }));

    setCustomer((prev) => ({
      ...prev,
      displayedParameters: newOrder,
    }));
  };

  const handleFetchMixers = (mixers) => {
    setFetchedCustomerOptions((prev) => ({
      ...prev,
      mixers: [
        ...mixers.map((mixer) => ({
          ...mixer,
          label: mixer.name,
          value: mixer.id,
        })),
      ],
    }));
  };
  const handleFetchCFs = (cuttingFluids) => {
    setFetchedCustomerOptions((prev) => ({
      ...prev,
      cuttingFluids: [
        ...cuttingFluids.map((cf) => ({
          ...cf,
          label: cf.name,
          value: cf.id,
        })),
      ],
    }));
  };
  const handleFetchParams = (params) => {
    setFetchedCustomerOptions((prev) => ({
      ...prev,
      parameters: params.map((parameter) => ({
        ...parameter,
        label: getParameterName(parameter, currentLang),
        value: parameter.id,
      })),
    }));
  };
  const handleSetCustomerName = (customerName) => {
    setCustomer((prev) => ({ ...prev, name: customerName }));
  };
  const handleSetCustomerID = (customerID) => {
    setCustomer((prev) => ({ ...prev, id: customerID }));
  };
  const handleSetCustomerMixer = (customerMixer) => {
    setCustomer((prev) => ({
      ...prev,
      mixer: { ...customerMixer },
    }));
  };
  const handleSetCustomerCuttingFluid = (customerCF) => {
    setCustomer((prev) => ({ ...prev, cuttingFluid: customerCF }));
  };
  const handleSetCustomerStatus = (customerStatus) => {
    setCustomer((prev) => ({
      ...prev,
      activeStatus: customerStatus,
    }));
  };
  const handleSetCustomerDisplayedParameters = (
    customerDisplayedParameters
  ) => {
    setCustomer((prev) => ({
      ...prev,
      displayedParameters: customerDisplayedParameters,
    }));
  };
  const handleAddCustomerDisplayedParameters = (newParameter) => {
    setCustomer((prev) => ({
      ...prev,
      displayedParameters: [...prev.displayedParameters, newParameter],
    }));
  };
  const handleSetCustomerAbstractParameters = (customerAbstractParameters) => {
    setCustomer((prev) => ({
      ...prev,
      abstractParameters: customerAbstractParameters,
    }));
  };
  const handleSetCustomerOverridedMixerParams = (
    customerOverridedMixerParams
  ) => {
    setCustomer((prev) => ({
      ...prev,
      overridedMixerParams: customerOverridedMixerParams?.length > 0,
    }));
  };
  const handleSetCustomerOverridedCFParams = (customerOverridedCFParams) => {
    setCustomer((prev) => ({
      ...prev,
      overridedCFParams: customerOverridedCFParams?.length > 0,
    }));
  };

  const handleSetCustomer = (data) => {
    handleSetCustomerName(data.name),
      handleSetCustomerID(data.id),
      handleSetCustomerMixer(data.mixer_model),
      handleSetCustomerCuttingFluid(data.cutting_fluid_model),
      handleSetCustomerStatus(data.is_active),
      handleSetCustomerDisplayedParameters(data.displayed_parameters),
      handleSetCustomerAbstractParameters(data.abstract_parameters);
    handleSetCustomerOverridedMixerParams(data.override_mixer_parameters);
    handleSetCustomerOverridedCFParams(data.override_cf_parameters);
  };

  const handleSaveCustomerSettings = async (values) => {
    const { mixer, cf, active_status: status, name } = values;
    const mixerID = mixer?.value || mixer;
    const cfID = cf?.value || cf;
    const active_status = status.toLowerCase() === "active" ? true : false;

    try {
      const response = await editCustomer(
        customerID,
        mixerID,
        cfID,
        customer.displayedParameters.map((item) => ({
          parameter_id: item.parameter.id,
          is_statistical: item.is_statistical,
          ordinal_number: item.ordinal_number,
        })),
        active_status,
        name
      );
      if (response) {
        message.success("Customer Settings Saved");
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleRemoveCustomer = async () => {
    let customerTimeout;
    try {
      const response = await removeCustomer(customerID);
      if (response) {
        message
          .success("Customer successfuly deleted! You will be redirected")
          .then(() => {
            navigate(routes.CUSTOMERS, { replace: true });
          });
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    } finally {
      if (customerTimeout) {
        clearTimeout(customerTimeout);
      }
    }
  };

  const addParameter = (parameterID) => {
    const newDisplayedParameter = fetchedCustomerOptions.parameters.find(
      (param) => param.id === parameterID
    );

    handleAddCustomerDisplayedParameters({
      parameter: newDisplayedParameter,
      is_statistical: false,
      ordinal_number: customer.displayedParameters?.length + 1 || "1",
    });
  };

  const uniqParamsArray =
    fetchedCustomerOptions.parameters !== undefined &&
    customer.displayedParameters !== undefined
      ? fetchedCustomerOptions.parameters.filter((parameter) => {
          const displayedParameter = customer.displayedParameters?.find(
            (param) => param.parameter.id === parameter.id
          );
          return !displayedParameter;
        })
      : [];

  const {
    isLoading: isLoadingCustomer,
    isError: isErrorCustomer,
    error: errorCustomer,
    isSuccess: isSuccessCustomer,
    data: customerData,
    remove: removeGetCustomer,
  } = useQuery("getCustomer", () => getCustomerLite(customerID));
  useMemo(() => {
    isSuccessCustomer && handleSetCustomer(customerData);
  }, [isSuccessCustomer, customerData]);

  const {
    isLoading: isLoadingCF,
    isError: isErrorCF,
    error: errorCF,
    isSuccess: isSuccessCF,
    data: CFdata,
    remove: removeGetCF,
  } = useQuery("getCuttingFluids", () => getCuttingFluids());
  useMemo(() => {
    isSuccessCF && handleFetchCFs(CFdata.results);
  }, [isSuccessCF, CFdata]);

  const {
    isLoading: isLoadingMixer,
    isError: isErrorMixer,
    error: errorMixer,
    isSuccess: isSuccessMixer,
    data: mixerData,
    remove: removeGetMixer,
  } = useQuery("getMixers", () => getMixers());
  useMemo(() => {
    isSuccessMixer && handleFetchMixers(mixerData.results);
  }, [isSuccessMixer, mixerData]);

  const {
    isLoading: isLoadingParameters,
    isError: isErrorParameters,
    error: errorParameters,
    isSuccess: isSuccessParameters,
    data: parametersData,
    remove: removeGetParameters,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    "getParameters",
    ({ pageParam = 1 }) => getParameters(pageParam),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.next !== null) {
          const url = new URL(lastPage.next);
          const nextPage = url.searchParams.get("page");
          return nextPage;
        }
        return undefined;
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    isSuccessParameters &&
      !hasNextPage &&
      handleFetchParams(parametersData.pages.flatMap((page) => page.results));
  }, [parametersData]);

  useEffect(() => {
    hasNextPage && fetchNextPage();
  }, [parametersData]);

  useEffect(() => {
    return () => {
      removeGetCF();
      removeGetCustomer();
      removeGetMixer();
      removeGetParameters();
    };
  }, [currentLang]);

  if (useGetCurrentPage() !== "settings") {
    return <Outlet />;
  }

  if (permissions.role !== roles.admin.toLowerCase())
    return <>{customer.name && <ROSettings customer={customer} />}</>;

  return (
    <>
      {isLoadingCustomer && <Loader />}
      {isErrorCustomer && <Error errorMsg={errorCustomer.message} />}
      {isSuccessCustomer && (
        <>
          <Flex
            justify="space-between"
            align="center"
            vertical={width < 1035}
            gap={"small"}
          >
            <PageHeader title={t("customer.settings.name")} />
            <AbstractParamWidget />
          </Flex>

          <Form
            layout="vertical"
            size={UXsize}
            style={{ marginTop: 40 }}
            initialValues={{
              name: customer.name,
              mixer: { label: customer.mixer.name, value: customer.mixer.id },
              cf: {
                label: isMobile
                  ? customer.cuttingFluid.name?.slice(0, width / 80) + "..."
                  : customer.cuttingFluid.name,
                value: customer.cuttingFluid.id,
              },
              active_status: t(
                `statuses.${customer.activeStatus ? "active" : "inactive"}`
              ),
            }}
            onFinish={handleSaveCustomerSettings}
          >
            <Flex justify="space-between" wrap="wrap">
              <Form.Item
                name="name"
                label={t("labels.name")}
                style={{ width: isMobile ? "100%" : "45%" }}
              >
                <Input placeholder={t("placeholders.name")} />
              </Form.Item>
              <Flex
                style={{ width: isMobile ? "100%" : "45%" }}
                gap="middle"
                align="end"
              >
                <Form.Item
                  name="mixer"
                  label={t("labels.mixer")}
                  style={{ width: "100%" }}
                >
                  <Select style={{ width: "100%" }}>
                    {fetchedCustomerOptions.mixers.map((mixer) => (
                      <Select.Option key={mixer.id} value={mixer.id}>
                        {mixer.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  {isOverridedMixer ? (
                    <Badge dot style={{ top: -12, padding: 5 }}>
                      <Link
                        to={routes.EDITCUSTOMERMIXER}
                        style={{
                          backgroundColor: colors.blue,
                          color: "white",
                          padding: UXpadSize,
                          borderRadius: UXrad,
                        }}
                        state={customer.mixer}
                      >
                        <Space>
                          <EditFilled />
                          {t("buttons.edit")}
                        </Space>
                      </Link>
                    </Badge>
                  ) : (
                    <Link
                      to={routes.EDITCUSTOMERMIXER}
                      style={{
                        backgroundColor: colors.blue,
                        color: "white",
                        padding: UXpadSize,
                        borderRadius: UXrad,
                      }}
                    >
                      <Space>
                        <EditFilled />
                        {t("buttons.edit")}
                      </Space>
                    </Link>
                  )}
                </Form.Item>
              </Flex>
            </Flex>

            <Flex justify="space-between" wrap="wrap">
              <Form.Item
                name="active_status"
                label={t("labels.status")}
                style={{ width: isMobile ? "100%" : "45%" }}
              >
                <Select style={{ width: "100%" }}>
                  {fetchedCustomerOptions.statuses.map((status) => (
                    <Select.Option key={status.value} value={status.value}>
                      {t(`statuses.${status.value}`)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Flex
                style={{ width: isMobile ? "100%" : "45%" }}
                gap="middle"
                align="end"
              >
                <Form.Item
                  name="cf"
                  label={t("labels.cf")}
                  style={{ width: "100%" }}
                >
                  <Select style={{ width: "100%" }}>
                    {fetchedCustomerOptions.cuttingFluids.map((cf) => (
                      <Select.Option key={cf.id} value={cf.id}>
                        {isMobile
                          ? cf.name?.slice(0, width / 80) + "..."
                          : cf.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  {isOverridedCF ? (
                    <Badge dot style={{ top: -12, padding: 5 }}>
                      <Link
                        to={routes.EDITCUSTOMERCF}
                        style={{
                          backgroundColor: colors.blue,
                          color: "white",
                          padding: UXpadSize,
                          borderRadius: UXrad,
                        }}
                      >
                        <Space>
                          <EditFilled />
                          {t("buttons.edit")}
                        </Space>
                      </Link>
                    </Badge>
                  ) : (
                    <Link
                      to={routes.EDITCUSTOMERCF}
                      style={{
                        backgroundColor: colors.blue,
                        color: "white",
                        padding: UXpadSize,
                        borderRadius: UXrad,
                      }}
                    >
                      <Space>
                        <EditFilled />
                        {t("buttons.edit")}
                      </Space>
                    </Link>
                  )}
                </Form.Item>
              </Flex>
            </Flex>
            <DisplayedParameters
              params={customer.displayedParameters}
              handleDelete={confirmDelete}
              handleChecked={handleCheckedDisplayedParameters}
              reorderArrayHandler={handleReorderDisplayedParams}
              addParameter={addParameter}
              uniqParamsArray={uniqParamsArray}
            />
            <Space size="large" style={{ marginTop: 40 }} wrap={width < 425}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ padding: "0 48px" }}
              >
                {t("buttons.save")}
              </Button>
              <Popconfirm
                title="Remove the customer"
                description="Are you sure to remove this customer?"
                onConfirm={handleRemoveCustomer}
                okText={"Yes"}
                cancelText={"No"}
              >
                <Button type="primary" danger>
                  {t("buttons.remove.customer")}
                </Button>
              </Popconfirm>
            </Space>
          </Form>
        </>
      )}
    </>
  );
};
