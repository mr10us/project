import { useState, useEffect, useMemo, useCallback } from "react";
import { ConfigProvider, App, Button, Space, Flex } from "antd";
import { EvalIndicator } from "./EvalIndicator/EvalIndicator";
import { parseToColumns } from "../utils/parseToColumns";
import { EvalInputIndicator } from "./EvalInputIndicator/EvalInputIndicator";
import { StandartTable } from "./UI/StandartTable/StandartTable";
import _debounce from "lodash/debounce";
import { DisplayStaticParamsButton } from "./DisplayStaticParamsButton";
import { numberFormatToString } from "../utils/numberFormat";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../hooks/useGetCurrentLang";
import { calculate } from "../http/customersApi";
import { useGetCustomerID } from "../hooks/useGetCustomerID";
import { useMutation } from "react-query";
import { findNestedValue } from "../utils/findNestedValue";
import { CustomEmpty } from "./UI/CustomEmpty";
import { checkIfPercent } from "../utils/Parameters/checkIfPercent";
import { CalcPercents } from "../utils/Parameters/CalcPercents";

export const MeasurementTable = ({
  measurements,
  setMeasurements,
  tableFixedColumns,
  tableFixedRows,
  readOnly,
  handlePagination,
  total,
  statistics,
  pageSize = 10,
}) => {
  const [visibleStaticParams, setVisibleStaticParams] = useState(false);
  const [measuredParams, setMeasuredParams] = useState(null);

  const { t } = useTranslation();
  const { width } = useGetCurrentSize();
  const customerID = useGetCustomerID();
  const { message } = App.useApp();

  const { mutate: calcParams, isLoading } = useMutation(
    () => calculate(customerID, measuredParams),
    {
      onError: (error) => {
        const errorMsg = findNestedValue(error?.response?.data || null);
        message.error(errorMsg || error.message);
      },
      onSuccess: (data) => {
        handleUpdateMeasurements(data);
      },
    }
  );

  const handleUpdateMeasurements = (data) => {
    setMeasurements((prevMeasurements) => {
      // Создаем новый массив измерений на основе данных из formated
      const updatedMeasurements = prevMeasurements.map((measurement) => {
        // Находим соответствующий объект из formated по machine.id
        const updatedMeasurement = data.measurements.find(
          (row) =>
            (row.machine && row.machine?.id === measurement.machine?.id) ||
            (row.machine === null && measurement.machine === null)
        );
        if (updatedMeasurement) {
          const updatedParameters = updatedMeasurement.parameters.map(
            (param) => {
              let number = param.number;

              if (checkIfPercent(param)) number = CalcPercents.toValue(number);

              return { ...param, number: number };
            }
          );
          return { ...updatedMeasurement, parameters: updatedParameters };
        } else {
          return measurement;
        }
      });
      return updatedMeasurements;
    });
  };

  const rewriteMeasure = (data) => {
    const machine = measurements.find((item) => item.machine?.id === data.id);
    if (!machine) {
      return new Error("Machine not found");
    }

    setMeasurements((prev) =>
      prev.map((row) => {
        if (
          row.machine?.id === data.id ||
          (row.machine === null && data.id === "abstract")
        ) {
          return {
            ...machine,
            machine:
              machine.machine.id === "abstract" ? null : { ...machine.machine },
            parameters: machine.parameters.map((param) => {
              if (param.parameter.id === data.parameter_id) {
                return { ...param, number: data.number };
              }
              return param;
            }),
          };
        }
        return row;
      })
    );

    const measuredParams = {
      packet_id: measurements[0].packet_id,
      measurements: measurements.map((row) => {
        const machineID = row.machine.id === "abstract" ? null : row.machine.id;

        return { machine_id: machineID };
      }),
    };
    setMeasuredParams(measuredParams);
  };

  const handleMeasurableParamChange = (data) => {
    rewriteMeasure(data);
  };

  const currentLang = useGetCurrentLang();

  const tableColumns = useMemo(
    () =>
      measurements.length > 0
        ? parseToColumns(
            measurements,
            currentLang,
            tableFixedColumns || [],
            visibleStaticParams,
            width,
            statistics
          )
        : [],
    [measurements, visibleStaticParams, currentLang, tableFixedColumns]
  );

  const filteredParameters = useMemo(() => {
    return measurements.map((row) =>
      tableColumns.map((col) => {
        const param = row.parameters.find(
          (item) => item.parameter.id === col.dataIndex
        );
        if (param) {
          if (readOnly) {
            if (param.number !== null) {
              const formatedValue = numberFormatToString(param.number);

              return (
                <EvalIndicator
                  value={formatedValue}
                  evaluation={param.evaluation}
                />
              );
            } else return <EvalIndicator value={t("fillers.awaiting_data")} />;
          } else {
            if (param.type === "static") {
              const formatedValue = numberFormatToString(param.number);

              return <EvalIndicator value={formatedValue} />;
            }
            if (param.type === "calculated") {
              if (param.number !== null) {
                const formatedValue = numberFormatToString(param.number);

                return (
                  <EvalIndicator
                    value={formatedValue}
                    evaluation={param.evaluation}
                  />
                );
              } else
                return <EvalIndicator value={t("fillers.awaiting_data")} />;
            }
            if (param.type === "measured")
              return (
                <EvalInputIndicator
                  evaluation={param.evaluation}
                  value={param.number}
                  placeholder={t("placeholders.measurement")}
                  onChange={(value) =>
                    handleMeasurableParamChange({
                      id: row.machine?.id,
                      parameter_id: param.parameter.id,
                      number: value,
                    })
                  }
                />
              );
          }
        }
      })
    );
  }, [measurements, visibleStaticParams, tableColumns]);

  const paramTableRows = useMemo(
    () =>
      filteredParameters.map((rowData) => {
        const row = {};
        for (let i = 0; i < rowData.length; i++) {
          row[tableColumns[i].dataIndex] = rowData[i];
        }
        return row;
      }),
    [filteredParameters, tableColumns]
  );

  const tableRows = useMemo(
    () =>
      paramTableRows
        .map((row, index) => ({
          key: index, //tableFixedRows[index]?.id ||
          ...row,
          ...tableFixedRows[index],
        }))
        .sort((a, b) => a.ordinal_number - b.ordinal_number),
    [paramTableRows]
  );

  useEffect(() => {
    if (!readOnly) {
      if (measurements.length > 0) {
        const measuredParams = {
          packet_id: measurements[0].packet_id,
          measurements: measurements.map((row) => {
            const parameters = row.parameters
              .filter((param) => param.type === "measured")
              .map((param) => {
                let value = param.number;

                if (checkIfPercent(param))
                  value = CalcPercents.toPercents(value);

                return {
                  parameter_id: param.parameter.id,
                  number: value,
                };
              });
            const machineID =
              row.machine.id === "abstract" ? null : row.machine.id;

            return { machine_id: machineID, parameters: parameters };
          }),
        };
        setMeasuredParams(measuredParams);
      }
    }
  }, [measurements]);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     calcParams();
  //   }, 500);
  //
  //   return () => clearTimeout(timeout);
  // }, [measuredParams]);

  const emptyTable = filteredParameters.some((row) => row.length === 0);

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#f0f0f0",
          },
        },
      }}
    >
      <Flex justify="end" gap={"middle"} align="center" wrap="wrap">
        <DisplayStaticParamsButton
          visible={visibleStaticParams}
          setVisible={setVisibleStaticParams}
        />
        {!readOnly ? (
          <Button
            type="primary"
            style={{ height: 40 }}
            loading={isLoading}
            onClick={calcParams}
          >
            {t("buttons.calculate")}
          </Button>
        ) : null}
      </Flex>
      {!emptyTable ? (
        <StandartTable
          items={tableRows}
          columns={tableColumns}
          handlePagination={handlePagination}
          pageSize={pageSize}
          total={total}
          sticky
        />
      ) : (
        <CustomEmpty />
      )}
    </ConfigProvider>
  );
};
