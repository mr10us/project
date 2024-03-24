import { useState, useEffect } from "react";
import { Space, Form, Flex, Input, Button, Spin, App } from "antd";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "../../../components/UI/Search/Search";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { CalculatedParameters } from "../../../components/CalculatedParameters";
import { getBrands } from "../../../http/brandsApi";
import {
  getCuttingFluids,
  editCuttingFluid,
  getCuttingFluid,
  removeCuttingFluid,
} from "../../../http/cuttingFluidApi";
import { getParameters } from "../../../http/parametersApi";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { fillEvals } from "../../../utils/Parameters/fillEvals";
import { formatEvals } from "../../../utils/formatEvals";
import { ValidParams } from "../../../components/ValidParams";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";
import { useInfiniteQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { findNestedValue } from "../../../utils/findNestedValue";
import { ExclamationCircleTwoTone } from "@ant-design/icons";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { useTranslation } from "react-i18next";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const EditCFM = () => {
  const [staticParams, setStaticParams] = useState([]); // Current
  const [measurableParams, setMeasurableParams] = useState([]); // Current
  const [calculatedParams, setCalculatedParams] = useState([]); // Current

  const [cuttingFluidModel, setCuttingFluidModel] = useState({});

  const [searchParams, setSearchParams] = useState([]);
  const [allParams, setAllParams] = useState([]); // All CF Params

  const [selectedValues, setSelectedValues] = useState({});
  const [fetchedValues, setFetchedValues] = useState({
    brands: [],
    parent_models: [],
  });

  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useSelector(selectCurrentLang);
  const { state } = useLocation();
  const { message, modal } = App.useApp();

  const handleBrandSelect = (brandID) => {
    setSelectedValues({ brand: brandID });
  };
  const handleParentModelSelect = (parentID) => {
    setSelectedValues({ parentModel: parentID });
  };

  const handleFetchedBrands = (brands) => {
    setFetchedValues((prevValues) => {
      return { ...prevValues, brands: [...prevValues.brands, ...brands] };
    });
  };
  const handleFetchedParentModels = (models) => {
    setFetchedValues((prevValues) => {
      return {
        ...prevValues,
        parent_models: [...prevValues.parent_models, ...models],
      };
    });
  };

  const fetchBrands = async (query) => {
    try {
      const response = await getBrands(query);
      if (response) {
        handleFetchedBrands(
          response.results.map((brand) => ({
            value: brand.id,
            label: brand.name,
          }))
        );
        if (response.next) await fetchBrands(`${response.next.split("?")[1]}`);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const fetchParentModels = async (query) => {
    try {
      const response = await getCuttingFluids(query);
      if (response) {
        handleFetchedParentModels(
          response.results.map((model) => ({
            value: model.id,
            label: model.name,
          }))
        );
        if (response.next)
          await fetchParentModels(`${response.next.split("?")[1]}`);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const {
    data: cfFetchedParams,
    remove,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["getParameters"],
    ({ pageParam = 1 }) => getParameters(pageParam, "type=2"),
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
      onSuccess: (data) => {
        setAllParams(
          data.pages.flatMap((page) =>
            page.results.map((item) => ({
              ...item,
              label: getParameterName(item, currentLang),
              value: item.id,
            }))
          )
        );
      },
    }
  );

  useEffect(() => {
    hasNextPage && fetchNextPage();
  }, [cfFetchedParams]);

  const fetchCFModel = async () => {
    try {
      const response = await getCuttingFluid(state.id);
      if (response) {
        setCuttingFluidModel(response);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCFModel(), fetchBrands(), fetchParentModels()]).then(() =>
      setTimeout(() => setLoading(false), 500)
    );
  }, [currentLang]);

  useEffect(() => {
    () => remove();
  }, []);

  useEffect(() => {
    const staticParameters = cuttingFluidModel?.parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value !== null
    );
    const measuredParameters = cuttingFluidModel?.parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value === null
    );
    const calculatedParameters = cuttingFluidModel?.parameters?.filter(
      (parameter) => parameter.formulas !== null
    );

    staticParameters?.length > 0 &&
      setStaticParams(
        staticParameters.map((parameter) => {
          if (checkIfPercent(parameter))
            parameter.static_value = CalcPercents.toValue(parameter.static_value);
          return {
            ...parameter,
            label: getParameterName(parameter.parameter, currentLang),
            value: parameter.static_value,
            id: parameter.parameter.id,
          };
        })
      );

    measuredParameters?.length > 0 &&
      setMeasurableParams(
        measuredParameters?.map((parameter) => ({
          param: {
            label: getParameterName(parameter.parameter, currentLang),
            id: parameter.parameter.id,
          },
          evaluations: fillEvals(parameter.evaluations),
        }))
      );

    calculatedParameters?.length > 0 &&
      setCalculatedParams(
        calculatedParameters?.map((parameter) => ({
          param: {
            label: getParameterName(parameter.parameter, currentLang),
            id: parameter.parameter.id,
          },
          evaluations: fillEvals(parameter.evaluations),
          formulas: parameter.formulas,
        }))
      );
  }, [cuttingFluidModel, currentLang]);

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

  const editCF = async (
    cfID,
    cfName,
    brandID,
    parameters,
    parentID,
    comments
  ) => {
    try {
      const response = await editCuttingFluid(cfID, {
        name: cfName,
        brandID: brandID,
        parameters: parameters,
        parentID: parentID,
        comment: comments,
      });
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleSubmit = (values) => {
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
        parameter_id: item?.id || item?.param?.id,
        evaluations: formatEvals(item.evaluations),
      })),
      ...calculatedParams.map((item) => ({
        formulas: conditionsArrToObj(item.conditionsArray),
        static_value: null,
        parameter_id: item?.id || item?.param?.id,
        evaluations: formatEvals(item.evaluations),
      })),
    ];
    editCF(
      cuttingFluidModel.id,
      values.name || cuttingFluidModel.name,
      selectedValues?.brand || cuttingFluidModel.brand.id,
      params,
      selectedValues?.parentModel || cuttingFluidModel?.parent?.id,
      values.comment || cuttingFluidModel.comment
    );
  };

  const confirmDelete = () => {
    modal.confirm({
      title: "Confirm the deletion",
      content: "Are you sure you want to delete the cutting fluid model?",
      type: "warning",
      onOk: handleDeleteCF,
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

  const handleDeleteCF = async () => {
    try {
      const response = await removeCuttingFluid(cuttingFluidModel.id);
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  return (
    <>
      <PageHeader title={t("settings.cf.edit.title")} margin />
      <ValidParams />
      <Space direction="vertical" style={{ width: "100%" }}>
        <h2>{t("settings.cf.edit.details")}</h2>
        {cuttingFluidModel.name && (
          <Form
            layout="vertical"
            size="large"
            onFinish={handleSubmit}
            initialValues={{
              name: cuttingFluidModel.name,
              comment: cuttingFluidModel?.comment,
            }}
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
                  <Search
                    placeholder={t("placeholders.parent")}
                    options={fetchedValues.parent_models}
                    defaultValue={
                      cuttingFluidModel.parent && {
                        value: cuttingFluidModel.parent.id,
                        label: cuttingFluidModel.parent.name,
                      }
                    }
                    handleSelect={handleParentModelSelect}
                  />
                </Form.Item>
                <Form.Item label={t("labels.brand")} style={{ width: "45%" }}>
                  <Search
                    placeholder={t("placeholders.brand")}
                    options={fetchedValues.brands}
                    defaultValue={
                      cuttingFluidModel.brand && {
                        value: cuttingFluidModel.brand.id,
                        label: cuttingFluidModel.brand.name,
                      }
                    }
                    handleSelect={handleBrandSelect}
                  />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label={t("labels.comment")}
                  style={{ width: "45%" }}
                >
                  <Input placeholder={t("placeholders.comment")} />
                </Form.Item>
              </Flex>
            </Form.Item>

            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {loading ? (
                <Loader />
              ) : (
                <>
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
                </>
              )}
            </Space>

            <Space size="large">
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
                onClick={confirmDelete}
                style={{ padding: "0 64px" }}
              >
                {t("buttons.delete")}
              </Button>
            </Space>
          </Form>
        )}
      </Space>
    </>
  );
};
