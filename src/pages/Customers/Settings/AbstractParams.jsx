import { CalculatedParameters } from "../../../components/CalculatedParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { useEffect, useState } from "react";
import { Button, Space, Spin, Form, App } from "antd";
import { getParameters } from "../../../http/parametersApi";
import { editAbstract, getCustomer } from "../../../http/customersApi";
import { useNavigate } from "react-router-dom";
import { roles } from "../../../consts";
import { formatEvals } from "../../../utils/formatEvals";
import { ValidParams } from "../../../components/ValidParams";
import { useGetPermissions } from "../../../hooks/useGetParmissions";
import { findNestedValue } from "../../../utils/findNestedValue";
import { fillEvals } from "../../../utils/Parameters/fillEvals";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { useTranslation } from "react-i18next";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";


export const AbstractParams = () => {
  const [staticParams, setStaticParams] = useState([]);
  const [measurableParams, setMeasurableParams] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState([]);

  const [searchParams, setSearchParams] = useState([]);

  const [allParams, setAllParams] = useState([]);

  const [loading, setLoading] = useState(false);

  const { role } = useGetPermissions();
  const currentLang = useGetCurrentLang();
  const customerID = useGetCustomerID();
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const handleAddStaticParams = (param) => {
    setStaticParams(param);
  };
  const handleAddMeasurableParams = (param) => {
    setMeasurableParams(param);
  };
  const handleAddCalculatedParams = (param) => {
    setCalculatedParams(param);
  };

  const handleStaticParamsDelete = (paramID) => {
    setStaticParams((prev) => prev.filter((param) => param.id !== paramID));
  };
  const handleMeasurableParamsDelete = (paramID) => {
    setMeasurableParams((prev) => prev.filter((param) => param.id !== paramID));
  };
  const handleCalculatedParamsDelete = (paramID) => {
    setCalculatedParams((prev) => prev.filter((param) => param.id !== paramID));
  };

  const handleFetchedParams = (params) => {
    setAllParams(
      params.map((param) => ({
        ...param,
        label: getParameterName(param, currentLang),
        value: param.id,
      }))
    );
  };

  const fetchParameters = async (nextPage = 1, query = { type: 4 }) => {
    try {
      const response = await getParameters(nextPage, query);
      if (response) {
        handleFetchedParams(response.results);
        if (response.next) {
          const url = new URL(response.next);
          const nextPage = url.searchParams.get("page");
          await fetchParameters(nextPage, { type: 4 });
        }
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleFillAbstractParams = (parameters) => {
    const staticParameters = parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value !== null
    );
    const measurableParameters = parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value === null
    );
    const calculatedParameters = parameters?.filter(
      (parameter) =>
        parameter.formulas !== null && parameter.static_value === null
    );

    setStaticParams(
      staticParameters.map((param) => {
        if (checkIfPercent(param))
          param.static_value = CalcPercents.toValue(param.static_value);
        return {
          ...param,
          label: getParameterName(param.parameter, currentLang),
          value: param.static_value,
          id: param.parameter.id,
        };
      })
    );
    setMeasurableParams(
      measurableParameters?.map((parameter) => ({
        param: {
          label: getParameterName(parameter.parameter, currentLang),
          id: parameter.parameter.id,
        },
        evaluations: fillEvals(parameter.evaluations),
      }))
    );
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
  };
  const fetchAbstractParameters = async () => {
    try {
      if (customerID) {
        const response = await getCustomer(customerID);
        if (response) handleFillAbstractParams(response.abstract_parameters);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleSaveAbstractParameters = async () => {
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
      const response = await editAbstract(customerID, params);
      if (response) {
        message.success("Abstract parameters saved successfuly!");
        navigate(-1, { replace: true });
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAbstractParameters().then(() =>
      setTimeout(() => setLoading(false), 300)
    );
    fetchParameters();
  }, [currentLang]);

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
      <PageHeader title={t("parameters.abstract.name")} margin />
      <ValidParams />
      <Form layout="vertical" size="large">
        {loading ? (
          <Spin spinning={loading} size="large" />
        ) : (
          <>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <StaticParameters
                noDelete={role !== roles.admin.toLowerCase()}
                params={staticParams}
                onChange={handleAddStaticParams}
                onDelete={handleStaticParamsDelete}
                searchParams={searchParams}
              />
              <MeasurableParameters
                noDelete={role !== roles.admin.toLowerCase()}
                params={measurableParams}
                onChange={handleAddMeasurableParams}
                onDelete={handleMeasurableParamsDelete}
                searchParams={searchParams}
              />
              <CalculatedParameters
                noDelete={role !== roles.admin.toLowerCase()}
                params={calculatedParams}
                onChange={handleAddCalculatedParams}
                onDelete={handleCalculatedParamsDelete}
                searchParams={searchParams}
              />
            </Space>
            {role === roles.admin.toLowerCase() ? (
              <Button
                type="primary"
                onClick={handleSaveAbstractParameters}
                style={{ padding: "0 48px" }}
              >
                {t("buttons.save")}
              </Button>
            ) : null}
          </>
        )}
      </Form>
    </>
  );
};
