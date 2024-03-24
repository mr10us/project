import { useState, useEffect } from "react";
import { Space, Form, Button, Spin, App } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { CalculatedParameters } from "../../../components/CalculatedParameters";
import { editCustomerMachineCFParams } from "../../../http/customerMachinesApi";
import { getCustomerMachineParameters } from "../../../http/customerMachinesApi";
import { formatEvals } from "../../../utils/formatEvals";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { ValidParams } from "../../../components/ValidParams";
import { fillEvals } from "../../../utils/Parameters/fillEvals";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";
import { findNestedValue } from "../../../utils/findNestedValue";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { getCustomerParameters } from "../../../http/customersApi";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const EditCustomerMachineCF = () => {
  const [staticParams, setStaticParams] = useState([]);
  const [measurableParams, setMeasurableParams] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState([]);

  const [customerMachineParams, setCustomerMachineParams] = useState([]);

  const [loading, setLoading] = useState(false);

  const machineData = useLocation()?.state;
  const currentLang = useGetCurrentLang();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const customerID = useGetCustomerID();
  const { message } = App.useApp();

  const machineID = machineData?.machineID;

  const handleSaveMachineModelParams = async () => {
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
      const response = await editCustomerMachineCFParams(machineID, params);
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const fetchMachineModelParams = async () => {
    try {
      const response = await getCustomerMachineParameters(
        machineID,
        "cutting-fluid"
      );
      if (response) {
        setCustomerMachineParams({
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
    setLoading(true);
    fetchMachineModelParams().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    const staticParameters = customerMachineParams?.parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value !== null
    );
    const measuredParameters = customerMachineParams?.parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value === null
    );
    const calculatedParameters = customerMachineParams?.parameters?.filter(
      (parameter) =>
        parameter.formulas !== null && parameter.static_value === null
    );

    setStaticParams(
      staticParameters?.map((parameter) => {
        if (checkIfPercent(parameter))
          parameter.static_value = CalcPercents.toValue(parameter.static_value);
        if (
          customerMachineParams.override_ids?.includes(parameter.parameter.id)
        )
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
        if (
          customerMachineParams.override_ids?.includes(parameter.parameter.id)
        )
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
        if (
          customerMachineParams.override_ids?.includes(parameter.parameter.id)
        )
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
  }, [customerMachineParams, currentLang]);

  return (
    <>
      <ValidParams />
      <Space direction="vertical" style={{ marginBottom: 40 }}>
        <PageHeader title={t("customer.settings.edit.cf.title", machineID)} />
        <p>Cutting Fluid: {machineData?.cf}</p>
      </Space>

      {loading ? (
        <Spin spinning={loading} size="large" />
      ) : (
        <Form size="large" onFinish={handleSaveMachineModelParams}>
          {staticParams && (
            <StaticParameters
              params={staticParams}
              onChange={setStaticParams}
              noDelete
            />
          )}
          {measurableParams && (
            <MeasurableParameters
              params={measurableParams}
              onChange={setMeasurableParams}
              noDelete
            />
          )}
          {calculatedParams && (
            <CalculatedParameters
              params={calculatedParams}
              onChange={setCalculatedParams}
              noDelete
            />
          )}

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
