import { useState, useEffect, useMemo } from "react";
import { Space, Form, Flex, Input, Button, App } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "../../../components/UI/Search/Search";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StaticParameters } from "../../../components/StaticParameters";
import { MeasurableParameters } from "../../../components/MeasurableParameters";
import { CalculatedParameters } from "../../../components/CalculatedParameters";
import { useSelector } from "react-redux";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import {
  editMachineModel,
  getMachineModel,
  getMachineModels,
  removeMachineModel,
} from "../../../http/machineModelsApi";
import { getMachineTypes } from "../../../http/machineTypeApi";
import { getBrands } from "../../../http/brandsApi";
import { getParameters } from "../../../http/parametersApi";
import { formatEvals } from "../../../utils/formatEvals";
import { ValidParams } from "../../../components/ValidParams";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { fillEvals } from "../../../utils/Parameters/fillEvals";
import { Loader } from "../../../components/Loader";
import { conditionsArrToObj } from "../../../utils/Parameters/conditionsArrToObj";
import { findNestedValue } from "../../../utils/findNestedValue";
import { ExclamationCircleTwoTone } from "@ant-design/icons";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const EditMachineModel = () => {
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
  const [machineModel, setMachineModel] = useState({});

  const [loading, setLoading] = useState(false);

  const [allParams, setAllParams] = useState([]);

  const currentLang = useSelector(selectCurrentLang);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state } = useLocation();
  const { message, modal } = App.useApp();
  const machineID = useMemo(
    () => state?.id || pathname.split("/").filter(Boolean)[2],
    [pathname, state]
  );

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
        ...parents.filter((parent) => parent.value !== machineID),
      ],
    }));
  };
  const handleFetchedMachineParams = (params) => {
    setAllParams((prev) => [...prev, ...params]);
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
      const response = await getMachineModel(machineID);
      if (response) handleSetMachineModel(response);
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleEditMachineModel = async (values) => {
    const params = [
      ...staticParams.map((item) => {
        console.log(item);
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
      const response = await editMachineModel(machineModel.id || machineID, {
        name: values.name || machineModel.name,
        brandID: selected.brandId || machineModel.brand.id,
        parameters: params,
        parentID: selected.parentId || machineModel.parent?.id || null,
        comment: values.comment || machineModel.comment,
        typeID: selected.typeId || machineModel.type.id,
      });
      if (response) {
        message.success("Machine model updated successfuly!");
        navigate(-1, { replace: true });
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const confirmDelete = () => {
    modal.confirm({
      title: "Confirm the deletion",
      content: "Are you sure you want to delete the machine model?",
      type: "warning",
      onOk: handleDeleteMachineModel,
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

  const handleDeleteMachineModel = async () => {
    try {
      const response = await removeMachineModel(machineModel.id || machineID);
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
    ]).then(() => setTimeout(() => setLoading(false), 500));
  }, [currentLang]);

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
        staticParameters.map((parameter) => {
          if (checkIfPercent(parameter))
            parameter.static_value = CalcPercents.toValue(
              parameter.static_value
            );
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
        calculatedParameters.map((parameter) => ({
          param: {
            label: getParameterName(parameter.parameter, currentLang),
            id: parameter.parameter.id,
          },
          evaluations: fillEvals(parameter.evaluations),
          formulas: parameter.formulas,
        }))
      );
  }, [machineModel, currentLang]);

  useEffect(() => {
    setMachineModelParams((prev) => ({
      ...prev,
      parameters: allParams.filter((param) => {
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
      }),
    }));
  }, [staticParams, measurableParams, calculatedParams, allParams]);

  return (
    <>
      <PageHeader title={`Edit Machine Model: ${machineModel.name}`} margin />
      <ValidParams />
      <Space direction="vertical" style={{ width: "100%" }}>
        <h2>Details</h2>
        {machineModel.name && (
          <Form
            layout="vertical"
            size="large"
            initialValues={{
              name: machineModel.name,
              comment: machineModel.comment,
            }}
            onFinish={handleEditMachineModel}
          >
            <Flex wrap="wrap" gap={5} justify="space-between">
              <Form.Item name="name" label="Name" style={{ width: "45%" }}>
                <Input placeholder="Enter name of machine mode" />
              </Form.Item>
              <Form.Item
                label="Parent model (optional)"
                style={{ width: "45%" }}
              >
                <Search
                  options={machineModelParams.parents}
                  defaultValue={
                    machineModel.parent?.id && {
                      value: machineModel.parent?.id || null,
                      label: machineModel.parent?.name || null,
                    }
                  }
                  handleSelect={handleSetParentId}
                />
              </Form.Item>
              <Form.Item style={{ width: "45%" }}>
                <Form.Item label="Type">
                  <Search
                    options={machineModelParams.types}
                    defaultValue={{
                      value: machineModel.type.id,
                      label: machineModel.type.name[currentLang],
                    }}
                    handleSelect={handleSetTypeId}
                  />
                </Form.Item>
                <Form.Item label="Brand">
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
                label="Comment (optional)"
                style={{ width: "45%" }}
              >
                <Input.TextArea rows={6} placeholder="Enter comment" />
              </Form.Item>
            </Flex>

            {loading ? (
              <Loader />
            ) : (
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                <StaticParameters
                  params={staticParams}
                  searchParams={machineModelParams.parameters}
                  onChange={setStaticParams}
                />
                <MeasurableParameters
                  params={measurableParams}
                  searchParams={machineModelParams.parameters}
                  onChange={setMeasurableParams}
                />
                <CalculatedParameters
                  params={calculatedParams}
                  searchParams={machineModelParams.parameters}
                  onChange={setCalculatedParams}
                />
              </Space>
            )}

            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                style={{ padding: "0 64px" }}
              >
                Save
              </Button>
              <Button
                type="primary"
                danger
                onClick={confirmDelete}
                style={{ padding: "0 64px" }}
              >
                Delete
              </Button>
            </Space>
          </Form>
        )}
      </Space>
    </>
  );
};
