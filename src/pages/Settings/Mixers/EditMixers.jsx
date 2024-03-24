import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Flex, Form, Space, Input, Button, Spin, App } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { Search } from "../../../components/UI/Search/Search";
import { StaticParameters } from "../../../components/StaticParameters";
import {
  editMixer,
  getMixer,
  getMixers,
  removeMixer,
} from "../../../http/mixersApi";
import { getBrands } from "../../../http/brandsApi";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { getParameters } from "../../../http/parametersApi";
import { ValidParams } from "../../../components/ValidParams";
import { getParameterName } from "../../../utils/Parameters/langParamsHelper";
import { findNestedValue } from "../../../utils/findNestedValue";
import { ExclamationCircleTwoTone } from "@ant-design/icons";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";

export const EditMixer = () => {
  const [staticParams, setStaticParams] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [brands, setBrands] = useState([]);
  const [parentModels, setParentModels] = useState([]);
  const [mixer, setMixer] = useState({});

  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useState([]);
  const [allParams, setAllParams] = useState([]);

  const navigate = useNavigate();
  const { state } = useLocation();
  const currentLang = useSelector(selectCurrentLang);
  const { message, modal } = App.useApp();

  const handleBrandSelect = (brandID) => {
    setSelectedValues((prev) => ({ ...prev, brand: brandID }));
  };
  const handleParentModelSelect = (parentID) => {
    setSelectedValues((prev) => ({ ...prev, parentModel: parentID }));
  };

  const fetchMixer = async () => {
    try {
      const response = await getMixer(state.key);
      if (response) {
        setStaticParams(
          response.parameters.map((param) => {
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
        setMixer({
          mixerName: response.name,
          mixerId: response.id,
          mixerBrand: response.brand,
          mixerParent: response.parent,
          mixerComment: response.comment,
        });
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
        setAllParams((prevMixerParams) => [
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
          await fetchMixerParams(nextPage, { type: 3 });
        }
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBrands(),
      fetchParentModels(),
      fetchMixer(),
      fetchMixerParams(),
    ]).then(() => setLoading(false));
  }, [currentLang]);

  const editMixerModel = async (
    mixerID,
    mixerName,
    brandID,
    parentID,
    comment,
    parameters
  ) => {
    try {
      const response = await editMixer(mixerID, {
        mixerName,
        brandID,
        parameters,
        parentID,
        comment,
      });
      if (response) navigate(-1);
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const handleSubmit = (values) => {
    const params = staticParams.map((param) => {
      if (checkIfPercent(param))
        param.value = CalcPercents.toPercents(param.value);
      return {
        formulas: null,
        static_value: param.value,
        parameter_id: param.id,
        evaluations: {},
      };
    });
    editMixerModel(
      mixer.mixerId,
      values.name,
      mixer.mixerBrand.id,
      selectedValues?.parentModel || mixer.mixerParent?.id || null,
      values.comment,
      params
    );
  };

  const confirmDelete = () => {
    modal.confirm({
      title: "Confirm the deletion",
      content: "Are you sure you want to delete the mixer?",
      type: "warning",
      onOk: () => handleDeleteMixer(),
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

  const handleDeleteMixer = async () => {
    try {
      const response = await removeMixer(mixer.mixerId);
      if (response) navigate(-1);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    setSearchParams(
      allParams.filter((param) => {
        const isUsingStatic = Boolean(
          staticParams.find((parameter) => parameter.id === param.value)
        );

        if (isUsingStatic) return false;
        return true;
      })
    );
  }, [staticParams, allParams]);

  return (
    <>
      <PageHeader title={`Edit Mixer Model ${mixer?.mixerName}`} margin />
      <ValidParams />
      <Space direction="vertical" style={{ width: "100%" }}>
        <h2>Details</h2>
        {mixer.mixerName && (
          <Form
            layout="vertical"
            size="large"
            onFinish={handleSubmit}
            initialValues={{
              name: mixer.mixerName,
              comment: mixer.mixerComment,
            }}
          >
            <Form.Item>
              <Flex wrap="wrap" gap={5} justify="space-between">
                <Form.Item
                  name="name"
                  label="Name"
                  style={{ width: "45%" }}
                  rules={[
                    {
                      required: true,
                      message: "Name should not be empty",
                    },
                  ]}
                >
                  <Input placeholder="Enter name of machine mode" />
                </Form.Item>
                <Form.Item
                  label="Parent model (optional)"
                  style={{ width: "45%" }}
                >
                  <Search
                    defaultValue={
                      mixer.mixerParent && {
                        value: mixer.mixerParent.id,
                        label: mixer.mixerParent.name,
                      }
                    }
                    placeholder={"Select parent model"}
                    options={parentModels}
                    handleSelect={handleParentModelSelect}
                  />
                </Form.Item>
                <Form.Item label="Brand" style={{ width: "45%" }}>
                  <Search
                    defaultValue={
                      mixer.mixerBrand && {
                        value: mixer.mixerBrand.id,
                        label: mixer.mixerBrand.name,
                      }
                    }
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
            {loading ? (
              <Spin spinning={loading} style={{ display: "block" }} />
            ) : (
              staticParams && (
                <StaticParameters
                  params={staticParams}
                  searchParams={searchParams}
                  onChange={setStaticParams}
                />
              )
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
                style={{ padding: "0 64px" }}
                onClick={confirmDelete}
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
