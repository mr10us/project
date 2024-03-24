import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { FileExcelOutlined } from "@ant-design/icons";
import { getMeasurements } from "../../../http/measurementsApi";
import { DisplayStatistics } from "../../../components/DisplayStatistics";
import { Flex, Form } from "antd";
import { MeasurementTable } from "../../../components/MeasurementTable";
import { Loader } from "../../../components/Loader";
import { MeasurementRangeSelector } from "../../../components/MeasurementRangeSelector";
import { getDate } from "../../../utils/time";
import { CustomEmpty } from "../../../components/UI/CustomEmpty";
import { useInfiniteQuery, useQuery } from "react-query";
import { Error } from "../../../components/Error";
import { useHandlePagination } from "../../../hooks/useHandlePagination";
import { useGetTotalPages } from "../../../hooks/useGetTotalPages";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { useGetLocale } from "../../../hooks/useGetLocale";
import { useTranslation } from "react-i18next";
import { getLocaleDate } from "../../../utils/dateHelper";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { numberFormatToString } from "../../../utils/numberFormat";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";
import { PDFViewer } from "../../../components/PDFViewer";
import { ExportToExcel } from "../../../components/ExportToExcel";
import { ExportToPDF } from "../../../components/ExportToPDF";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";

export const MachineMeasurement = () => {
  const [measurements, setMeasurements] = useState([]);

  const [query, setQuery] = useState("");

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const locale = useGetLocale();
  const customerID = useGetCustomerID();
  const currentLang = useGetCurrentLang();
  const { width } = useGetCurrentSize();

  const fixedCols = useMemo(() => [
    {
      name: "created_at",
      title: t("customer.measurements.for_machine.columns.date"),
    },
  ]);
  const staticTableRows = useMemo(() => {
    return measurements.map((item) => ({
      created_at: getLocaleDate(item.created_at, locale),
    }));
  }, [measurements]);

  const getSelectedMeasurements = async ({ machine_id, date_range }) => {
    const after = getDate(date_range[0]);
    const before = getDate(date_range[1]);

    let query = `machine_id=${machine_id}`;

    if (after !== undefined) {
      query += `&created_at_after=${after}`;
    }
    if (before !== undefined) {
      query += `&created_at_before=${before}`;
    }

    setQuery(query);
    setTimeout(() => refetch(), 200);
  };

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    remove,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["getMeasurements", query],
    ({ pageParam = 1 }) => getMeasurements(pageParam, query, customerID),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.next !== null) {
          const urlParams = new URLSearchParams(lastPage.next);
          const nextPage = urlParams.get("page");
          return nextPage;
        }
        return undefined;
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      enabled: false,
      onSuccess: (data) => {
        setMeasurements(
          data.pages.flatMap((page) =>
            page.results.map((measurements) => ({
              ...measurements,
              parameters: measurements.parameters.map((param) => {
                if (checkIfPercent(param))
                  param.number = CalcPercents.toValue(param.number);
                return param;
              }),
            }))
          )
        );
      },
    }
  );

  const { handlePagination, currentPage } = useHandlePagination(
    fetchNextPage,
    hasNextPage
  );
  const total = useGetTotalPages(data);

  const buttons = useMemo(
    () =>
      [
        width > 565
          ? {
              element: (
                <PDFViewer
                  type="measurement"
                  query={query}
                  currentPage={currentPage}
                  customerID={customerID}
                />
              ),
            }
          : null,
        {
          element: (
            <ExportToPDF
              type="measurement"
              query={query}
              currentPage={currentPage}
              customerID={customerID}
            />
          ),
        },
        {
          element: (
            <ExportToExcel
              type="measurement"
              query={query}
              currentPage={currentPage}
              customerID={customerID}
            />
          ),
        },
      ].filter(Boolean),
    [isSuccess, query, currentLang, width]
  );

  const statistics = useMemo(
    () => isSuccess && !hasNextPage && data.pages[0].statistics,
    [data]
  );

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader
        title={t("customer.measurements.for_machine.title")}
        buttons={buttons}
        margin
        size="large"
      />
      <Form
        size="large"
        layout="vertical"
        form={form}
        onFinish={getSelectedMeasurements}
        style={{ marginBottom: 40 }}
      >
        <MeasurementRangeSelector isLoading={isLoading} />
      </Form>
      {isLoading && <Loader />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && (
        <Flex vertical gap="large">
          {statistics.length === 0 && measurements.length === 0 ? (
            <CustomEmpty description={t("no_data.title")} />
          ) : (
            <>
              {measurements.length > 0 && (
                <MeasurementTable
                  readOnly
                  measurements={measurements}
                  setMeasurements={setMeasurements}
                  tableFixedColumns={fixedCols}
                  tableFixedRows={staticTableRows}
                  handlePagination={handlePagination}
                  total={total}
                />
              )}
              {statistics.length > 0 && (
                <DisplayStatistics statistics={statistics} />
              )}
            </>
          )}
        </Flex>
      )}
    </>
  );
};
