import { useEffect, useMemo, useState } from "react";
import { Flex, Form, Input, Button, Select, App } from "antd";
import { useMutation, useQuery } from "react-query";
import {
  createCustomer,
  getCustomerLite,
  getCustomers,
} from "../../http/customersApi";
import { getCuttingFluids } from "../../http/cuttingFluidApi";
import { getMixers } from "../../http/mixersApi";
import { PageHeader } from "../PageHeader/PageHeader";
import { CustomModal } from "../Modal/CustomModal";
import { CustomersContent } from "../CustomersContent/CustomersContent";
import { handleErrorFields } from "../../utils/handleErrorFields";
import { Loader } from "../Loader";
import { Error } from "../Error";
import { StandartFilter } from "../UI/Filters/StandartFilter/StandartFilter";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";
import { useTranslation } from "react-i18next";
import { findNestedValue } from "../../utils/findNestedValue";
import { useGetCurrentLang } from "../../hooks/useGetCurrentLang";
import { useGetPermissions } from "../../hooks/useGetParmissions";
import { Navigate } from "react-router-dom";
import { NotFound } from "../NotFound";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../features/Customer/customer";

export const CustomersContainer = () => {
  const [openModal, setModalOpen] = useState(false);
  const [selectedCustomerParams, setSelectedCustomerParams] = useState({});
  const [query, setQuery] = useState("");

  const { width } = useGetCurrentSize();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const currentLang = useGetCurrentLang();
  const { t } = useTranslation();
  const { available_customers } = useGetPermissions();
  const dispatch = useDispatch();

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSelectMixer = (mixerID) => {
    setSelectedCustomerParams((prev) => ({ ...prev, mixerID: mixerID }));
  };

  const handleSelectCuttingFluid = (cfID) => {
    setSelectedCustomerParams((prev) => ({ ...prev, cfID: cfID }));
  };

  const filterItems = useMemo(
    () => [
      {
        key: "1",
        label: t("filter.by.order"),
        type: "ordering",
        children: (
          <StandartFilter.Radio
            buttons={[
              { value: "+name", name: t("filter.options.+name") },
              { value: "-name", name: t("filter.options.-name") },
            ]}
          />
        ),
      },
      {
        key: "2",
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
    ],
    [currentLang]
  );

  const {
    isLoading: isLoadingMixers,
    isSuccess: isSuccessMixers,
    data: dataMixers,
  } = useQuery(["getMixers", query], () => getMixers(query));

  const {
    isLoading: isLoadingCF,
    isSuccess: isSuccessCF,
    data: dataCF,
  } = useQuery(["getCuttingFluids", query], () => getCuttingFluids(query));

  const {
    isLoading: isLoadingCustomers,
    isSuccess: isSuccessCustomers,
    data: dataCustomers,
    isError: isErrorCustomers,
    error: errorCustomers,
    refetch: refreshCustomers,
  } = useQuery(["getCustomers", query], () => getCustomers(query));
  const customers = useMemo(
    () => (isSuccessCustomers ? dataCustomers.results : []),
    [isSuccessCustomers, dataCustomers]
  );

  const mutation = useMutation(
    (request) =>
      createCustomer(request.customerName, request.mixerID, request.cfID),
    {
      onSuccess: () => {
        refreshCustomers();
        handleModalClose();
      },
      onError: (error) => {
        if (error?.data) {
          const errorFields = handleErrorFields(error.data);
          form.setFields(errorFields);
        } else {
          const errorMsg = findNestedValue(error?.response?.data || null);
          message.error(errorMsg || error.message);
        }
      },
    }
  );

  const handleCreateCustomer = (values) => {
    const { name: customerName } = values;
    const { mixerID, cfID } = selectedCustomerParams;

    mutation.mutate({ customerName, mixerID, cfID });
  };

  const customerID = useMemo(() => {
    if (available_customers && available_customers.length === 1) {
      return [available_customers];
    }
    return null;
  }, [available_customers]);

  const { isLoading, isError, error, isSuccess, data } = useQuery(
    customerID ? ["getCustomer", customerID] : null,
    () => (customerID ? getCustomerLite(customerID) : Promise.resolve(null))
  );

  useEffect(() => {
    if (isSuccess && data) {
      const customer = { id: data.id, name: data.name };
      dispatch(setCustomer(customer));
    }
  }, [isSuccess, data, dispatch]);

  if (isError && available_customers?.length === 1)
    return <Error errorMsg={error.message} />;
  if (isLoading && available_customers?.length === 1) return <Loader />;
  if (isSuccess && data && available_customers?.length === 1) {
    return <Navigate to={`${data.id}`} />;
  }

  return (
    <>
      <CustomModal
        title={t("customers.add_customer_title")}
        open={openModal}
        onClose={handleModalClose}
      >
        <Form
          form={form}
          layout="vertical"
          size="large"
          style={{ width: "80%" }}
          onFinish={handleCreateCustomer}
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label={t("labels.name")}
            rules={[{ required: true, message: t("rules.name") }]}
          >
            <Input placeholder={t("placeholders.name")} />
          </Form.Item>
          <Form.Item
            name="mixer"
            label={t("labels.mixer")}
            rules={[{ required: true, message: t("rules.mixer") }]}
          >
            <Select
              onSelect={handleSelectMixer}
              placeholder={t("placeholders.mixer")}
            >
              {isSuccessMixers &&
                dataMixers.results.map((mixer) => (
                  <Select.Option key={mixer.id} value={mixer.id}>
                    {mixer.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="cf"
            label={t("labels.cf")}
            rules={[
              {
                required: true,
                message: t("rules.cf"),
              },
            ]}
          >
            <Select
              onSelect={handleSelectCuttingFluid}
              placeholder={t("placeholders.cf")}
            >
              {isSuccessCF &&
                dataCF.results.map((cf) => (
                  <Select.Option key={cf.id} value={cf.value}>
                    {cf.name}
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

      <Flex vertical gap="25px">
        <PageHeader
          title={t("customers.title")}
          buttons={[
            {
              name: t("customers.add_customer"),
              handler: handleModalOpen,
              loading: isLoadingCF && isLoadingMixers,
            },
          ]}
        />
        <Flex
          style={width < 768 ? { flexDirection: "column-reverse" } : {}}
          gap={"middle"}
          justify="space-between"
        >
          {isLoadingCustomers && <Loader loading={isLoadingCustomers} />}
          {isErrorCustomers && <Error errorMsg={errorCustomers.message} />}
          {isSuccessCustomers && <CustomersContent customers={customers} />}
          {customers.length > 1 ? (
            <div className="standart-filter-container">
              <StandartFilter filterItems={filterItems} setQuery={setQuery} />
            </div>
          ) : null}
        </Flex>
      </Flex>
    </>
  );
};
