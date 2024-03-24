import { Button, Form, Spin, App } from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import {
  editCustomerMixer,
  getCustomerParameters,
} from "../../../http/customersApi";
import { selectCustomerID } from "../../../features/Customer/customer";
import { ValidParams } from "../../../components/ValidParams";
import { findNestedValue } from "../../../utils/findNestedValue";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { useTranslation } from "react-i18next";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const EditCustomerMixer = () => {
  const [staticParams, setStaticParams] = useState([]);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const currentLang = useSelector(selectCurrentLang);
  const customerID = useSelector(selectCustomerID);

  const handleSetStaticParams = (params, overridedParamsID) => {
    setStaticParams(
      params.map((param) => {
        if (checkIfPercent(param))
          param.static_value = CalcPercents.toValue(param.static_value);
        if (overridedParamsID.includes(param.parameter.id))
          return {
            ...param,
            label: getParameterName(param.parameter, currentLang),
            value: param.static_value,
            id: param.parameter.id,
            isOverrided: true,
          };
        return {
          ...param,
          label: getParameterName(param.parameter, currentLang),
          value: param.static_value,
          id: param.parameter.id,
        };
      })
    );
  };

  const handleEditMixer = async () => {
    const paramsToSend = staticParams.map((param) => {
      if (checkIfPercent(param)) param.value = CalcPercents.toPercents(param.value);
      return {
        formulas: null,
        evaluations: {},
        static_value: param.value,
        parameter_id: param.id,
      };
    });

    try {
      if (customerID) {
        const response = await editCustomerMixer(customerID, paramsToSend);

        if (response) {
          message.success("Mixer updated successfuly!");
          navigate(-1, { replace: true });
        }
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const fetchCustomerMixerParameters = async () => {
    try {
      if (customerID) {
        const response = await getCustomerParameters(customerID, "mixer");
        if (response) {
          handleSetStaticParams(response.parameters, response.override_ids);
        }
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCustomerMixerParameters().then(() => setLoading(false));
  }, [currentLang]);

  return (
    <>
      <PageHeader title={t("customer.settings.edit.mixer.title")} margin />
      <ValidParams />
      {loading ? (
        <Spin spinning={loading} size="large" />
      ) : (
        <>
          <p className="hint">{}</p>
          <Form size="large" style={{ marginTop: 15 }}>
            <StaticParameters
              params={staticParams}
              noDelete
              onChange={setStaticParams}
            />
            <Form.Item>
              <Button
                type="primary"
                onClick={handleEditMixer}
                style={{ padding: "0 48px" }}
              >
                {t("buttons.save")}
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </>
  );
};
