import React, { useEffect, useState } from "react";
import {
  Flex,
  Space,
  Button,
  Collapse,
  Radio,
  Checkbox,
  DatePicker,
  ConfigProvider,
  Divider,
} from "antd";
import { useTranslation } from "react-i18next";
import { useLocation, useSearchParams } from "react-router-dom";
import { parseQueryToObj } from "../../../../utils/Filter/parseQueryToObj";
import { parseObjToQuery } from "../../../../utils/Filter/parseObjToQuery";
import { useGetCurrentSize } from "../../../../hooks/useGetCurrentSize";
import { getDate } from "../../../../utils/time";
import { RangeDatePicker } from "../../../RangeDatePicker";
import { debounce } from "lodash";

const { RangePicker } = DatePicker;

export const StandartFilter = ({
  filterItems,
  setQuery,
  collapseSize = 768,
}) => {
  const [filterValues, setFilterValues] = useState({});
  const [showButtons, setShowButtons] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const location = useLocation();
  const { width } = useGetCurrentSize();
  const { t } = useTranslation();

  const sendRequest = () => {
    const query = parseObjToQuery(filterValues);

    setQuery(query);
    setSearchParams(query);
  };

  // const sendRequestDebounced = debounce(sendRequest, 400);

  const reset = () => {
    setFilterValues({});
    setQuery("");
    setSearchParams("");
  };

  const handleFilterChange = (type, value) => {
    if (type === "date_range") {
      const after = getDate(value[0]);
      const before = getDate(value[1]);

      setFilterValues((prevValues) => ({
        ...prevValues,
        [type]: value,
        created_at_after: after,
        created_at_before: before,
      }));
    } else
      setFilterValues((prevValues) => ({
        ...prevValues,
        [type]: value,
      }));

    // sendRequestDebounced();
  };

  const handleToggleButtons = (collapseState) => {
    if (collapseState.length > 0) {
      setShowButtons(true);
    } else setShowButtons(false);
  };

  useEffect(() => {
    const parsedValues = parseQueryToObj(location.search);
    setFilterValues(parsedValues);
  }, [location.search]);

  if (width < collapseSize)
    return (
      <Collapse
        className="alignCenter"
        onChange={handleToggleButtons}
        size="small"
        items={[
          {
            key: "filter",
            label: (
              <Flex justify="space-between" align="center" wrap="wrap">
                <h3>{t("filter.name")}</h3>
                {showButtons ? (
                  <>
                    <Flex gap="small" wrap="wrap" justify={"end"}>
                      <Button type="primary" onClick={sendRequest}>
                        {t("buttons.apply")}
                      </Button>
                      <Button type="primary" danger onClick={reset}>
                        {t("buttons.reset")}
                      </Button>
                    </Flex>
                  </>
                ) : null}
              </Flex>
            ),
            children: (
              <Collapse
                style={{ cursor: "pointer" }}
                ghost
                expandIconPosition="end"
                items={filterItems.map((item) => {
                  const { type, children, ...rest } = item;
                  return {
                    ...rest,
                    children: React.cloneElement(children, {
                      onChange: (value) => handleFilterChange(type, value),
                      value: filterValues[type],
                    }),
                  };
                })}
              />
            ),
          },
        ]}
      />
    );
  else
    return (
      <Flex vertical>
        <Flex
          justify="space-between"
          align="center"
          className="filterHeader"
          style={{ minWidth: width < 768 ? "initial" : 250 }}
          wrap={width < 930 ? "wrap" : "initial"}
        >
          <h3 style={{ margin: "12px 0" }}>{t("filter.name")}</h3>
          <Flex
            gap="small"
            wrap="wrap"
            justify={width < 930 ? "normal" : "end"}
          >
            <Button type="primary" onClick={sendRequest} size="medium">
              {t("buttons.apply")}
            </Button>
            <Button type="primary" danger onClick={reset} size="medium">
              {t("buttons.reset")}
            </Button>
          </Flex>
        </Flex>
        <ConfigProvider theme={{ token: { borderRadiusLG: 0 } }}>
          <Collapse
            style={{ cursor: "pointer" }}
            ghost
            expandIconPosition="end"
            items={filterItems.map((item) => {
              const { type, children, ...rest } = item;
              return {
                ...rest,
                children: React.cloneElement(children, {
                  onChange: (value) => handleFilterChange(type, value),
                  value: filterValues[type],
                }),
              };
            })}
          />
        </ConfigProvider>
      </Flex>
    );
};

StandartFilter.Radio = ({ buttons, onChange, value }) => {
  return (
    <Radio.Group onChange={(e) => onChange(e.target.value)} value={value}>
      <Space direction="vertical">
        {buttons.map((button, idx) => (
          <Radio key={idx} value={button.value}>
            {button.name}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );
};
StandartFilter.Checkbox = ({ buttons, onChange, value }) => {
  return (
    <Checkbox.Group onChange={(values) => onChange(values)} value={value}>
      <Space direction="vertical">
        {buttons.map((button, idx) => (
          <Checkbox
            key={idx}
            value={
              typeof button.value === "boolean"
                ? button.value
                : String(button.value)
            }
          >
            {button.children}
          </Checkbox>
        ))}
      </Space>
    </Checkbox.Group>
  );
};
StandartFilter.DateRange = ({ onChange, value, cellRender }) => {
  return (
    <RangePicker
      cellRender={cellRender || null}
      onChange={(dates) => onChange(dates)}
      value={value}
      style={{ width: "100%" }}
    />
  );
};
StandartFilter.RangeDatePicker = ({ onChange }) => {
  return <RangeDatePicker onChange={onChange} style={{ width: "100%" }} />;
};
