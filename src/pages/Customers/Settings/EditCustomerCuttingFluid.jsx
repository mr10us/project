import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Space, Form, Spin, App } from "antd";
import { useSelector } from "react-redux";
import { CalculatedParameters } from "../../../components/CalculatedParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { formatEvals } from "../../../utils/formatEvals";
import { selectCustomerID } from "../../../features/Customer/customer";
import {
  getCustomerParameters,
  editCustomerCuttingFluid,
} from "../../../http/customersApi";
import { ValidParams } from "../../../components/ValidParams";
import { fillEvals } from "../../../utils/Parameters/fillEvals";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";
import { findNestedValue } from "../../../utils/findNestedValue";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const EditCustomerCuttingFluid = () => {
  const [staticParams, setStaticParams] = useState([]);
  const [measurableParams, setMeasurableParams] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState([]);

  const [customerCFParams, setCustomerCFParams] = useState([]);

  const [loading, setLoading] = useState(false);

  const currentLang = useGetCurrentLang();
  const customerID = useSelector(selectCustomerID);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { message } = App.useApp();

  const handleSaveCustomerCFParams = async () => {
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
    try {
      const response = await editCustomerCuttingFluid(customerID, params);
      if (response) {
        message.success("Saved successfuly!");
        navigate(-1, { replace: true });
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const fetchCustomerCFParams = async () => {
    try {
      const response = await getCustomerParameters(customerID, "cutting-fluid");
      if (response) {
        setCustomerCFParams({
          parameters: response.parameters,
          override_ids: response.override_ids,
        });
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    const staticParameters = customerCFParams?.parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value !== null
    );
    const measuredParameters = customerCFParams?.parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value === null
    );
    const calculatedParameters = customerCFParams?.parameters?.filter(
      (parameter) =>
        parameter.formulas !== null && parameter.static_value === null
    );
    setStaticParams(
      staticParameters?.map((parameter) => {
        if (checkIfPercent(parameter))
          parameter.static_value = CalcPercents.toValue(parameter.static_value);
        if (customerCFParams.override_ids?.includes(parameter.parameter.id))
          return {
            ...parameter,
            label: getParameterName(parameter.parameter, currentLang),
            value: parameter.static_value,
            id: parameter.parameter.id,
            isOverrided: true,
          };
        return {
          ...parameter,
          label: getParameterName(parameter.parameter, currentLang),
          value: parameter.static_value,
          id: parameter.parameter.id,
        };
      })
    );

    setMeasurableParams(
      measuredParameters?.map((parameter) => {
        if (customerCFParams.override_ids?.includes(parameter.parameter.id))
          return {
            param: {
              label: getParameterName(parameter.parameter, currentLang),
              id: parameter.parameter.id,
            },
            evaluations: fillEvals(parameter.evaluations),
            isOverrided: true,
          };
        return {
          param: {
            label: getParameterName(parameter.parameter, currentLang),
            id: parameter.parameter.id,
          },
          evaluations: fillEvals(parameter.evaluations),
        };
      })
    );

    setCalculatedParams(
      calculatedParameters?.map((parameter) => {
        if (customerCFParams.override_ids?.includes(parameter.parameter.id))
          return {
            param: {
              label: getParameterName(parameter.parameter, currentLang),
              id: parameter.parameter.id,
            },
            evaluations: fillEvals(parameter.evaluations),
            formulas: parameter.formulas,
            isOverrided: true,
          };
        return {
          param: {
            label: getParameterName(parameter.parameter, currentLang),
            id: parameter.parameter.id,
          },
          evaluations: fillEvals(parameter.evaluations),
          formulas: parameter.formulas,
        };
      })
    );
  }, [customerCFParams, currentLang]);

  useEffect(() => {
    setLoading(true);
    fetchCustomerCFParams().then(() => setLoading(false));
  }, []);

  return (
    <>
      <ValidParams />
      <PageHeader title={t("customer.settings.edit.cf.title")} margin />
      {loading ? (
        <Spin spinning={loading} size="large" />
      ) : (
        <Form size="large" onFinish={handleSaveCustomerCFParams}>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {staticParams && (
              <StaticParameters
                params={staticParams}
                noDelete
                onChange={setStaticParams}
              />
            )}
            {measurableParams && (
              <MeasurableParameters
                params={measurableParams}
                noDelete
                onChange={setMeasurableParams}
              />
            )}
            {calculatedParams && (
              <CalculatedParameters
                params={calculatedParams}
                noDelete
                onChange={setCalculatedParams}
              />
            )}
          </Space>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ padding: "0 48px" }}
            >
              {t("buttons.save")}
            </Button>
          </Form.Item>
        </Form>
      )}
    </>
  );
};
