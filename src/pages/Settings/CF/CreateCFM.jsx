import { useState, useEffect } from "react";
import { Space, Form, Flex, Input, Button, App } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search } from "../../../components/UI/Search/Search";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { CalculatedParameters } from "../../../components/CalculatedParameters";
import { getBrands } from "../../../http/brandsApi";
import {
  getCuttingFluids,
  createCuttingFluid,
} from "../../../http/cuttingFluidApi";
import { getParameters } from "../../../http/parametersApi";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { ValidParams } from "../../../components/ValidParams";
import { formatEvals } from "../../../utils/formatEvals";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";
import { useInfiniteQuery } from "react-query";
import { findNestedValue } from "../../../utils/findNestedValue";
import { useTranslation } from "react-i18next";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const CreateCFM = () => {
  const [staticParams, setStaticParams] = useState([]);
  const [measurableParams, setMeasurableParams] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState([]);

  const [selectedValues, setSelectedValues] = useState({});
  const [fetchedValues, setFetchedValues] = useState({
    brands: [],
    parent_models: [],
  });

  const [allParams, setAllParams] = useState([]);
  const [searchParams, setSearchParams] = useState([]);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useSelector(selectCurrentLang);
  const { message } = App.useApp();

  const handleBrandSelect = (brandID) => {
    setSelectedValues((prev) => ({ ...prev, brand: brandID }));
  };
  const handleParentModelSelect = (parentID) => {
    setSelectedValues((prev) => ({ ...prev, parentModel: parentID }));
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
          response.results.map(
            (brand) => new Object({ value: brand.id, label: brand.name })
          )
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
          response.results.map(
            (model) => new Object({ value: model.id, label: model.name })
          )
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
            page.results.map((item) => {
              return {
                ...item,
                label: getParameterName(item, currentLang),
                value: item.id,
              };
            })
          )
        );
      },
    }
  );

  useEffect(() => {
    hasNextPage && fetchNextPage();
  }, [cfFetchedParams]);

  useEffect(() => {
    fetchBrands();
    fetchParentModels();
    return () => remove();
  }, []);

  const createCF = async (cfName, brandID, parameters, parentID, comments) => {
    try {
      const response = await createCuttingFluid(
        cfName,
        brandID,
        parameters,
        parentID,
        comments
      );
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleSubmit = (values) => {
    const params = [
      ...staticParams.map((item) => {
        if (checkIfPercent(item))
          item.value = CalcPercents.toPercents(item.value);
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

    createCF(
      values.name,
      selectedValues.brand,
      params,
      selectedValues?.parentModel || null,
      values.comment
    );
  };

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

  return (
    <>
      <PageHeader title={t("settings.cf.add.title")} margin />
      <ValidParams />
      <Space direction="vertical" style={{ width: "100%" }}>
        <h2>{t("settings.cf.add.details")}</h2>
        <Form layout="vertical" size="large" onFinish={handleSubmit}>
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
                  handleSelect={handleParentModelSelect}
                />
              </Form.Item>
              <Form.Item label={t("labels.brand")} style={{ width: "45%" }}>
                <Search
                  placeholder={t("placeholders.brand")}
                  options={fetchedValues.brands}
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
