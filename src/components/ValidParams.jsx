import { useEffect } from "react";
import { Col, Drawer, FloatButton, List, Row, Select } from "antd";
import { useState } from "react";
import { getParameters } from "../http/parametersApi";
import { useInfiniteQuery } from "react-query";
import { Loader } from "./Loader";
import { Error } from "./Error";
import { QuestionOutlined } from "@ant-design/icons";
import { colors } from "../consts";
import { useGetCurrentLang } from "../hooks/useGetCurrentLang";
import { useTranslation } from "react-i18next";

const parameterName = (parameter, currentLang) => {
  const parameterName = parameter.name[currentLang] || parameter.name.en;
  const parameterShortUnit =
    parameter.short_unit[currentLang] || parameter.short_unit.en;

  return `${parameterName}, ${parameterShortUnit}`;
};

export const ValidParams = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const currentLang = useGetCurrentLang();
  const { t } = useTranslation();

  const toggleDrawer = () => {
    setOpenDrawer((prev) => !prev);
  };
  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  const handleSetSearchValue = (event) => {
    setSearchValue(event.target.value);
  };

  const filterParameters = (input) => {
    setSearchValue(input);
    if (input == "") return;
    setSearchParams(
      parameters.filter((param) =>
        `${param.variable_name} ${parameterName(param, currentLang)}`
          .toLowerCase()
          .includes(input.toLowerCase())
      )
    );
  };
  const selectParameter = (paramID) => {
    setSearchParams(parameters.filter((param) => param.id === paramID));
  };
  const clearSearchParams = () => {
    setSearchParams(null);
  };

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    remove,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    "validParams",
    ({ pageParam = 1 }) => getParameters(pageParam),
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
    }
  );
  const parameters = isSuccess
    ? data.pages.flatMap((page) => page.results)
    : [];

  useEffect(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, data]);

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <FloatButton
        icon={<QuestionOutlined />}
        shape="circle"
        tooltip={<span>{t("widgets.valid_params.tooltip")}</span>}
        onClick={toggleDrawer}
        badge={{ count: isSuccess && parameters.length, color: colors.blue }}
        style={{ right: 48 }}
      />
      <Drawer
        title={
          <p style={{ color: "rgb(60, 60, 60)", fontWeight: 400 }}>
            {t("widgets.valid_params.title")}
          </p>
        }
        placement="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
      >
        {isLoading && <Loader />}
        {isError && <Error errorMsg={error.message} />}
        {isSuccess && (
          <>
            <Select
              allowClear
              showSearch
              placeholder={t("placeholders.parameter")}
              searchValue={searchValue}
              style={{ width: "100%", marginBottom: 40 }}
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              filterSort={(optionA, optionB) =>
                (optionA?.children ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.children ?? "").toLowerCase())
              }
              autoClearSearchValue={false}
              onBlur={handleSetSearchValue}
              onSelect={selectParameter}
              onSearch={filterParameters}
              onClear={clearSearchParams}
            >
              {searchParams
                ? searchParams.map((parameter) => (
                    <Select.Option key={parameter.id} value={parameter.id}>
                      {`${parameterName(parameter, currentLang)}, ${
                        parameter.variable_name
                      }`}
                    </Select.Option>
                  ))
                : parameters.map((parameter) => (
                    <Select.Option key={parameter.id} value={parameter.id}>
                      {`${parameterName(parameter, currentLang)}, ${
                        parameter.variable_name
                      }`}
                    </Select.Option>
                  ))}
            </Select>
            <List
              dataSource={searchParams !== null ? searchParams : parameters}
              renderItem={(parameter) => (
                <Row gutter={[8, 8]} align="middle">
                  <Col span={4}>
                    <List.Item>{parameter.variable_name}</List.Item>
                  </Col>
                  <Col span={17} offset={2}>
                    <List.Item>
                      {parameterName(parameter, currentLang)}
                    </List.Item>
                  </Col>
                </Row>
              )}
            />
          </>
        )}
      </Drawer>
    </>
  );
};
