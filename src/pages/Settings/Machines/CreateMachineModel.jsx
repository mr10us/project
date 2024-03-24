import { useState, useEffect, useMemo } from "react";
import { Space, Form, Flex, Input, Button, App, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { CalculatedParameters } from "../../../components/CalculatedParameters";
import { useSelector } from "react-redux";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { getMachineModels } from "../../../http/machineModelsApi";
import { getMachineTypes } from "../../../http/machineTypeApi";
import { getBrands } from "../../../http/brandsApi";
import { getParameters } from "../../../http/parametersApi";
import { createMachineModel } from "../../../http/machineModelsApi";
import { ValidParams } from "../../../components/ValidParams";
import { useInfiniteQuery, useQuery } from "react-query";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { getMachineModelName } from "../../../utils/MachineModels/nameHelper";
import { formatEvals } from "../../../utils/formatEvals";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";
import { findNestedValue } from "../../../utils/findNestedValue";
import { useTranslation } from "react-i18next";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const CreateMachineModel = () => {
  const [staticParams, setStaticParams] = useState([]);
  const [measurableParams, setMeasurableParams] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState([]);

  const [searchParams, setSearchParams] = useState([]);

  const [selected, setSelected] = useState({});

  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useSelector(selectCurrentLang);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleSetBrandId = (brand) => {
    setSelected((prev) => ({ ...prev, brandId: brand }));
  };
  const handleSetTypeId = (type) => {
    setSelected((prev) => ({ ...prev, typeId: type }));
  };
  const handleSetParentId = (parent) => {
    setSelected((prev) => ({ ...prev, parentId: parent }));
  };

  const handleCreateMachineModel = async (values) => {
    const params = [
      ...staticParams.map((item) => {
        if (checkIfPercent(item)) item.value = CalcPercents.toPercents(item.value);
        return {
          formulas: null,
          static_value: item.value,
          parameter_id: item.id,
          evaluations: {},
        };
      }),
      ...measurableParams.map((item) => ({
        formulas: null,
        static_value: null,
        parameter_id: item.param.id,
        evaluations: formatEvals(item.evaluations),
      })),
      ...calculatedParams.map((item) => ({
        formulas: conditionsArrToObj(item.conditionsArray),
        static_value: null,
        parameter_id: item.param.id,
        evaluations: formatEvals(item.evaluations),
      })),
    ];
    try {
      const response = await createMachineModel(
        values.name,
        selected.brandId,
        params,
        selected.parentId || null,
        values.comment,
        selected.typeId
      );
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const {
    isLoading: isLoadingMachineTypes,
    isError: isErrorMachineTypes,
    error: errorMachineTypes,
    isSuccess: isSuccessMachineTypes,
    data: dataMachineTypes,
    remove: removeMachineTypes,
  } = useQuery("getMachineTypes", () => getMachineTypes(""));
  const machineTypes = useMemo(
    () => (isSuccessMachineTypes ? dataMachineTypes.results : []),
    [dataMachineTypes]
  );

  const {
    isLoading: isLoadingBrands,
    isError: isErrorBrands,
    error: errorBrands,
    isSuccess: isSuccessBrands,
    data: dataBrands,
    remove: removeBrands,
  } = useQuery("getBrands", () => getBrands(""));
  const machineBrands = useMemo(
    () => (isSuccessBrands ? dataBrands.results : []),
    [dataBrands]
  );

  const {
    isLoading: isLoadingParents,
    isError: isErrorParents,
    error: errorParents,
    isSuccess: isSuccessParents,
    data: dataParents,
    remove: removeParents,
  } = useQuery("getMachineParents", () => getMachineModels(""));
  const machineParents = useMemo(
    () => (isSuccessParents ? dataParents.results : []),
    [dataParents]
  );

  const {
    isSuccess: isSuccessParams,
    data: dataParams,
    remove: removeParams,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["getParameters"],
    ({ pageParam = 1 }) => getParameters(pageParam, "type=1"),
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
  const allParams = useMemo(
    () =>
      isSuccessParams
        ? dataParams.pages
            .map((page) =>
              page.results.map((param) => ({
                ...param,
                label: getParameterName(param, currentLang),
                value: param.id,
              }))
            )
            .flat()
        : [],
    [dataParams]
  );

  useEffect(() => {
    hasNextPage && fetchNextPage();
  }, [dataParams]);

  useEffect(() => {
    setSearchParams(
      allParams.filter((param) => {
        const isUsingStatic = Boolean(
          staticParams.find((parameter) => parameter.id === param.value)
        );
        const isUsingMeasurable = Boolean(
          measurableParams.find(
            (parameter) => parameter?.param?.id === param.value
          )
        );
        const isUsingCalculated = Boolean(
          calculatedParams.find(
            (parameter) => parameter?.param?.id === param.value
          )
        );

        if (isUsingStatic || isUsingMeasurable || isUsingCalculated)
          return false;
        return true;
      })
    );
  }, [staticParams, measurableParams, calculatedParams, allParams]);

  useEffect(() => {
    return () => {
      removeBrands();
      removeMachineTypes();
      removeParams();
      removeParents();
    };
  }, []);

  return (
    <>
      <PageHeader title={t("settings.machines.create.model.title")} margin />
      <ValidParams />
      <Space direction="vertical" style={{ width: "100%" }}>
        <h2>{t("settings.machines.create.model.details")}</h2>
        <Form
          layout="vertical"
          size="large"
          onFinish={handleCreateMachineModel}
          form={form}
          scrollToFirstError
        >
          <Form.Item>
            <Flex wrap="wrap" gap={5} justify="space-between">
              <Form.Item
                name="name"
                label={t("labels.name")}
                style={{ width: "45%" }}
                rules={[
                  {
                    required: true,
                    message: t("rules.name"),
                  },
                ]}
              >
                <Input placeholder={t("placeholders.name")} />
              </Form.Item>
              <Form.Item label={t("labels.parent")} style={{ width: "45%" }}>
                <Select
                  allowClear
                  placeholder={t("placeholders.parent")}
                  onSelect={handleSetParentId}
                >
                  {machineParents.map((parentModel) => (
                    <Select.Option key={parentModel.id} value={parentModel.id}>
                      {getMachineModelName(parentModel)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item style={{ width: "45%" }}>
                <Form.Item label={t("labels.type")}>
                  <Select
                    placeholder={t("placeholders.type")}
                    onSelect={handleSetTypeId}
                  >
                    {machineTypes.map((machineType) => (
                      <Select.Option
                        key={machineType.id}
                        value={machineType.id}
                      >
                        {machineType.name[currentLang]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label={t("labels.brand")}>
                  <Select
                    placeholder={t("placeholders.brand")}
                    onSelect={handleSetBrandId}
                  >
                    {machineBrands.map((machineBrand) => (
                      <Select.Option
                        key={machineBrand.id}
                        value={machineBrand.id}
                      >
                        {machineBrand.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form.Item>
              <Form.Item
                name="comment"
                label={t("labels.comment")}
                style={{ width: "45%" }}
              >
                <Input.TextArea
                  rows={6}
                  placeholder={t("placeholders.comment")}
                />
              </Form.Item>
            </Flex>
          </Form.Item>

          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <StaticParameters
              params={staticParams}
              searchParams={searchParams}
              onChange={setStaticParams}
            />
            <MeasurableParameters
              params={measurableParams}
              searchParams={searchParams}
              onChange={setMeasurableParams}
            />
            <CalculatedParameters
              params={calculatedParams}
              searchParams={searchParams}
              onChange={setCalculatedParams}
            />
          </Space>

          <Button
            type="primary"
            htmlType="submit"
            style={{ padding: "0 64px" }}
          >
            {t("buttons.save")}
          </Button>
        </Form>
      </Space>
    </>
  );
};
