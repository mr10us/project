import { useEffect, useState } from "react";
import { Space, Form, Button, Spin, App } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { CalculatedParameters } from "../../../components/CalculatedParameters";
import {
  editCustomerMachineModelParams,
  getCustomerMachineParameters,
} from "../../../http/customerMachinesApi";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { useSelector } from "react-redux";
import { fillEvals } from "../../../utils/Parameters/fillEvals";
import { formatEvals } from "../../../utils/formatEvals";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { ValidParams } from "../../../components/ValidParams";
import { useTranslation } from "react-i18next";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";
import { findNestedValue } from "../../../utils/findNestedValue";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const EditCustomerMachineModel = () => {
  const [staticParams, setStaticParams] = useState([]);
  const [measurableParams, setMeasurableParams] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState([]);

  const [customerMachineParams, setCustomerMachineParams] = useState([]);

  const [loading, setLoading] = useState(false);

  const machineData = useLocation()?.state;
  const currentLang = useSelector(selectCurrentLang);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const customerID = useGetCustomerID();
  const { t } = useTranslation();

  const machineID = machineData?.id;

  const handleSaveMachineModelParams = async () => {
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
    try {
      const response = await editCustomerMachineModelParams(
        machineData.machineID,
        params
      );
      if (response) {
        message.success("Machine updated successfuly!");
        navigate(-1);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const fetchMachineModelParams = async () => {
    try {
      const response = await getCustomerMachineParameters(
        machineData.machineID,
        "model"
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

  useEffect(() => {
    setLoading(true);
    fetchMachineModelParams().then(() => setLoading(false));
  }, []);

  return (
    <>
      <ValidParams />
      <Space direction="vertical" style={{ marginBottom: 40 }}>
        <PageHeader
          title={t("customer.machines.machine.edit.title", {
            machineID: machineID,
          })}
        />
        <p>
          {t("customer.machines.machine.edit.model", {
            modelName: machineData?.model,
          })}
        </p>
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
