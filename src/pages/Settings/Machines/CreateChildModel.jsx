import { useState, useEffect } from "react";
import { Space, Form, Flex, Input, Button, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "../../../components/UI/Search/Search";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { CalculatedParameters } from "../../../components/CalculatedParameters";
import { useSelector } from "react-redux";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import {
  createMachineModel,
  getMachineModel,
  getMachineModels,
  removeMachineModel,
} from "../../../http/machineModelsApi";
import { getMachineTypes } from "../../../http/machineTypeApi";
import { getBrands } from "../../../http/brandsApi";
import { getParameters } from "../../../http/parametersApi";
import { useTranslation } from "react-i18next";
import { formatEvals } from "../../../utils/formatEvals";
import { ValidParams } from "../../../components/ValidParams";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { Loader } from "../../../components/Loader";
import { findNestedValue } from "../../../utils/findNestedValue";
import { fillEvals } from "../../../utils/Parameters/fillEvals";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const CreateChildModel = () => {
  const [staticParams, setStaticParams] = useState([]);
  const [measurableParams, setMeasurableParams] = useState([]);
  const [calculatedParams, setCalculatedParams] = useState([]);

  const [machineModelParams, setMachineModelParams] = useState({
    types: [],
    brands: [],
    parents: [],
    parameters: [],
  });
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState([]);

  const [machineModel, setMachineModel] = useState({});

  const { t } = useTranslation();
  const currentLang = useSelector(selectCurrentLang);
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleSetBrandId = (brandId) => {
    setSelected((prev) => ({ ...prev, brandId: brandId }));
  };
  const handleSetTypeId = (typeId) => {
    setSelected((prev) => ({ ...prev, typeId: typeId }));
  };
  const handleSetParentId = (parentId) => {
    setSelected((prev) => ({ ...prev, parentId: parentId }));
  };

  const handleSetMachineModel = (machine) => {
    setMachineModel(machine);
  };

  const handleFetchedMachineTypes = (types) => {
    setMachineModelParams((prev) => ({
      ...prev,
      types: [...prev.types, ...types],
    }));
  };

  const handleFetchedBrands = (brands) => {
    setMachineModelParams((prev) => ({
      ...prev,
      brands: [...prev.brands, ...brands],
    }));
  };

  const handleFetchedParentModels = (parents) => {
    setMachineModelParams((prev) => ({
      ...prev,
      parents: [
        ...prev.parents,
        ...parents.filter((parent) => parent.value !== state.id),
      ],
    }));
  };
  const handleFetchedMachineParams = (params) => {
    setMachineModelParams((prev) => ({
      ...prev,
      parameters: [...prev.parameters, ...params],
    }));
  };

  const fetchMachineTypes = async (query) => {
    try {
      const response = await getMachineTypes(query);
      if (response) {
        handleFetchedMachineTypes(
          response.results.map((type) => ({
            value: type.id,
            label: type.name[currentLang],
          }))
        );
        if (response.next)
          await fetchMachineTypes(`${response.next.split("?")[1]}`);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
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

  const fetchMachineParents = async (query) => {
    try {
      const response = await getMachineModels(query);
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

  const fetchMachineParams = async (nextPage = 1, query = { type: 1 }) => {
    try {
      const response = await getParameters(nextPage, query);
      if (response) {
        handleFetchedMachineParams(
          response.results.map((item) => {
            return {
              ...item,
              label: getParameterName(item, currentLang),
              value: item.id,
            };
          })
        );

        if (response.next) {
          const url = new URL(response.next);
          const nextPage = url.searchParams.get("page");
          await fetchMachineParams(nextPage, { type: 1 });
        }
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const fetchMachine = async () => {
    try {
      const response = await getMachineModel(state);
      if (response) handleSetMachineModel(response);
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
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
      const response = await createMachineModel(
        values.name || machineModel.name,
        selected.brandId || machineModel.brand.id,
        params,
        selected.parentId || machineModel.parent?.id || null,
        values.comment || machineModel.comment,
        selected.typeId || machineModel.type.id
      );
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleDeleteMachineModel = async () => {
    try {
      const response = await removeMachineModel(machineModel.id || state.id);
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchMachine(),
      fetchMachineTypes(),
      fetchBrands(),
      fetchMachineParents(),
      fetchMachineParams(),
    ]).then(() => setTimeout(() => setLoading(false), 300));
  }, []);

  useEffect(() => {
    const staticParameters = machineModel?.parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value !== null
    );
    const measuredParameters = machineModel?.parameters?.filter(
      (parameter) =>
        parameter.formulas === null && parameter.static_value === null
    );
    const calculatedParameters = machineModel?.parameters?.filter(
      (parameter) => parameter.formulas !== null
    );

    staticParameters?.length > 0 &&
      setStaticParams(
        staticParameters.map((parameter) => ({
          ...parameter,
          label: getParameterName(parameter.parameter, currentLang),
          value: "",
          id: parameter.parameter.id,
        }))
      );

    measuredParameters?.length > 0 &&
      setMeasurableParams(
        measuredParameters.map((parameter) => ({
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
    handleSetParentId(state.id || machineModel.id);
  }, [machineModel]);

  return (
    <>
      <PageHeader
        title={t("settings.machines.create.parent.title", {
          parent: machineModel.name,
        })}
        margin
      />
      <ValidParams />
      <Space direction="vertical" style={{ width: "100%" }}>
        <h2>{t("settings.machines.create.parent.details")}</h2>
        {machineModel.name && (
          <Form
            layout="vertical"
            size="large"
            initialValues={{
              comment: machineModel.comment,
            }}
            onFinish={handleCreateMachineModel}
          >
            <Form.Item>
              <Flex wrap="wrap" gap={5} justify="space-between">
                <Form.Item
                  name="name"
                  label={t("labels.name")}
                  style={{ width: "45%" }}
                >
                  <Input placeholder={t("placeholders.name")} />
                </Form.Item>
                <Form.Item label={t("labels.parent")} style={{ width: "45%" }}>
                  <Search
                    options={machineModelParams.parents}
                    defaultValue={
                      machineModel.name && {
                        value: machineModel.id,
                        label: machineModel.name,
                      }
                    }
                    handleSelect={handleSetParentId}
                  />
                </Form.Item>
                <Form.Item style={{ width: "45%" }}>
                  <Form.Item label={t("labels.type")}>
                    <Search
                      options={machineModelParams.types}
                      defaultValue={{
                        value: machineModel.type.id,
                        label: machineModel.type[`name${currentLang}`],
                      }}
                      handleSelect={handleSetTypeId}
                    />
                  </Form.Item>
                  <Form.Item label={t("labels.brand")}>
                    <Search
                      options={machineModelParams.brands}
                      defaultValue={{
                        value: machineModel.brand.id,
                        label: machineModel.brand.name,
                      }}
                      handleSelect={handleSetBrandId}
                    />
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

            {loading ? (
              <Loader />
            ) : (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                {staticParams && (
                  <StaticParameters
                    params={staticParams}
                    searchParams={machineModelParams.parameters}
                    onChange={setStaticParams}
                  />
                )}
                {measurableParams && (
                  <MeasurableParameters
                    params={measurableParams}
                    searchParams={machineModelParams.parameters}
                    onChange={setMeasurableParams}
                  />
                )}
                {calculatedParams && (
                  <CalculatedParameters
                    params={calculatedParams}
                    searchParams={machineModelParams.parameters}
                    onChange={setCalculatedParams}
                  />
                )}
              </Space>
            )}

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
                onClick={handleDeleteMachineModel}
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
