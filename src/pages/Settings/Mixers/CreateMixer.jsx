import { useEffect, useState } from "react";
import { Flex, Form, Space, Input, Button, message } from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { Search } from "../../../components/UI/Search/Search";
import { StaticParameters } from "../../../components/StaticParameters";
import { createMixer, getMixers } from "../../../http/mixersApi";
import { useNavigate } from "react-router-dom";
import { getBrands } from "../../../http/brandsApi";
import { getParameters } from "../../../http/parametersApi";
import { useSelector } from "react-redux";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { ValidParams } from "../../../components/ValidParams";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { findNestedValue } from "../../../utils/findNestedValue";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const CreateMixer = () => {
  const navigate = useNavigate();
  const [staticParams, setStaticParams] = useState();
  const [selectedValues, setSelectedValues] = useState({});
  const [brands, setBrands] = useState([]);
  const [parentModels, setParentModels] = useState([]);

  const [mixerParams, setMixerParams] = useState([]);

  const currentLang = useSelector(selectCurrentLang);

  const handleBrandSelect = (brandID) => {
    setSelectedValues((prev) => ({ ...prev, brand: brandID }));
  };
  const handleParentModelSelect = (parentID) => {
    setSelectedValues((prev) => ({ ...prev, parentModel: parentID }));
  };

  const fetchBrands = async (query) => {
    try {
      const response = await getBrands(query);
      if (response) {
        setBrands(
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
      const response = await getMixers(query);
      if (response) {
        setParentModels(
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

  const fetchMixerParams = async (nextPage = 1, query = { type: 3 }) => {
    try {
      const response = await getParameters(nextPage, query);
      if (response) {
        setMixerParams((prevMixerParams) => [
          ...prevMixerParams,
          ...response.results.map((item) => ({
            ...item,
            label: getParameterName(item, currentLang),
            value: item.id,
          })),
        ]);

        if (response.next) {
          const url = new URL(response.next);
          const nextPage = url.searchParams.get("page");
          const type = url.searchParams.get("type");
          await fetchMixerParams(nextPage, { type: type });
        }
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchParentModels();
    fetchMixerParams();
  }, []);

  const createMixerModel = async (
    mixerName,
    brandID,
    parentID,
    comment,
    staticParams
  ) => {
    try {
      const response = await createMixer(
        mixerName,
        brandID,
        staticParams,
        parentID,
        comment || null
      );
      if (response) navigate(-1, { replace: true });
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleSubmit = (values) => {
    const params = staticParams.map((param) => {
      if (checkIfPercent(param)) param.value = CalcPercents.toPercents(param.value);
      return {
        formulas: null,
        static_value: param.value,
        parameter_id: param.id,
        evaluations: {},
      };
    });
    createMixerModel(
      values.name,
      selectedValues.brand,
      selectedValues.parentModel || null,
      values.comment,
      params
    );
  };

  return (
    <>
      <PageHeader title="Create Mixer Model" margin />
      <ValidParams />
      <Space direction="vertical" style={{ width: "100%" }}>
        <h2>Details</h2>
        <Form layout="vertical" size="large" onFinish={handleSubmit}>
          <Form.Item>
            <Flex wrap="wrap" gap={5} justify="space-between">
              <Form.Item
                name="name"
                label="Name"
                style={{ width: "45%" }}
                rules={[
                  { required: true, message: "Name should not be empty" },
                ]}
              >
                <Input placeholder="Enter name of machine mode" />
              </Form.Item>
              <Form.Item
                label="Parent model (optional)"
                style={{ width: "45%" }}
              >
                <Search
                  allowClear
                  placeholder={"Select parent model"}
                  options={parentModels}
                  handleSelect={handleParentModelSelect}
                />
              </Form.Item>
              <Form.Item label="Brand" style={{ width: "45%" }}>
                <Search
                  placeholder={"Select machine type"}
                  options={brands}
                  handleSelect={handleBrandSelect}
                />
              </Form.Item>
              <Form.Item
                name="comment"
                label="Comment (optional)"
                style={{ width: "45%" }}
              >
                <Input placeholder="Enter comment" />
              </Form.Item>
            </Flex>
          </Form.Item>
          <StaticParameters
            staticParams={staticParams}
            searchParams={mixerParams}
            searchType={3}
            onChange={setStaticParams}
          />
          <Button
            type="primary"
            htmlType="submit"
            style={{ padding: "0 64px" }}
          >
            Save
          </Button>
        </Form>
      </Space>
    </>
  );
};
