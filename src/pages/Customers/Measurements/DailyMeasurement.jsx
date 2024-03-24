import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { FileExcelOutlined } from "@ant-design/icons";
import { getMeasurements } from "../../../http/measurementsApi";
import { PacketStatistics } from "../../../components/PacketStatistics";
import { App, Button, DatePicker, Flex } from "antd";
import { MeasurementTable } from "../../../components/MeasurementTable";
import { CustomEmpty } from "../../../components/UI/CustomEmpty";
import { getDate } from "../../../utils/time";
import { Loader } from "../../../components/Loader";
import dayjs from "dayjs";
import { useInfiniteQuery } from "react-query";
import { Error } from "../../../components/Error";
import { useGetTotalPages } from "../../../hooks/useGetTotalPages";
import { useHandlePagination } from "../../../hooks/useHandlePagination";
import { SingleDatePicker } from "../../../components/SingleDatePicker";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { useGetLocale } from "../../../hooks/useGetLocale";
import { useTranslation } from "react-i18next";
import { getLocaleDate } from "../../../utils/dateHelper";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";
import { PDFViewer } from "../../../components/PDFViewer";
import { ExportToExcel } from "../../../components/ExportToExcel";
import { ExportToPDF } from "../../../components/ExportToPDF";

const currentDateDayjs = dayjs();

export const DailyMeasurements = () => {
  const [statistics, setStatistics] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  const customerID = useGetCustomerID();

  const [query, setQuery] = useState(
    `customer_id=${customerID}&created_at_after=${currentDateDayjs.format(
      "YYYY-MM-DD"
    )}&created_at_before=${currentDateDayjs.format("YYYY-MM-DD")}`
  );

  const { t } = useTranslation();
  const locale = useGetLocale();
  const currentLang = useGetCurrentLang();
  const { width } = useGetCurrentSize();

  const allParams = useMemo(
    () => measurements.map((item) => item.parameters),
    [measurements]
  );

  const fixedCols = useMemo(
    () =>
      width < 565
        ? [
            { name: "id", title: t("customer.measurements.all.columns.id") },
            {
              name: "model",
              title: t("customer.measurements.all.columns.model"),
            },
          ]
        : [
            { name: "id", title: t("customer.measurements.all.columns.id") },
            {
              name: "model",
              title: t("customer.measurements.all.columns.model"),
            },
            {
              name: "created_at",
              title: t("customer.measurements.all.columns.date"),
            },
          ],
    []
  );

  const staticTableRows = useMemo(
    () =>
      measurements.map((item) => ({
        id: item.machine.internal_number,
        model: `${item.machine_model.brand.name} ${item.machine_model.name} ${item.machine.internal_number}`,
        created_at: getLocaleDate(item.created_at, locale),
      })),
    [measurements]
  );

  const handleChangeDate = (date) => {
    if (date === null) {
      handleClearData();
      setQuery("");
    }
    setQuery(
      `customer_id=${customerID}&created_at_after=${getDate(
        date
      )}&created_at_before=${getDate(date)}`
    );
  };

  const handleClearData = () => {
    setStatistics([]);
    setMeasurements([]);
    setQuery("");
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
    refetch,
  } = useInfiniteQuery(
    ["getMeasurements"],
    ({ pageParam = 1 }) => getMeasurements(pageParam, query, customerID),
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
        !hasNextPage && setStatistics(data.pages[0].statistics);
      },
    }
  );

  const total = useGetTotalPages(data);
  const { handlePagination, currentPage } = useHandlePagination(
    fetchNextPage,
    hasNextPage
  );

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

  const handleRefetch = () => {
    refetch();
  };

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader
        title={t("customer.measurements.daily.title")}
        buttons={buttons}
        margin
        size="large"
      />

      <Flex
        gap="middle"
        wrap="wrap"
        align="center"
        style={{ marginBottom: 20 }}
      >
        <SingleDatePicker
          onChange={handleChangeDate}
          defaultValue={currentDateDayjs}
          filledCells={[]}
        />
        <Button
          type="primary"
          onClick={handleRefetch}
          size={width < 565 ? null : "large"}
          style={{ padding: "0 24px", alignSelf: "center" }}
        >
          {t("buttons.apply")}
        </Button>
      </Flex>

      <Flex vertical gap="large">
        {isLoading && <Loader />}
        {isError && <Error errorMsg={error.message} />}
        {isSuccess && (
          <>
            {statistics.length === 0 && measurements.length === 0 ? (
              <CustomEmpty description={t("no_data.title")} />
            ) : (
              <>
                {measurements.length > 0 && (
                  <MeasurementTable
                    readOnly
                    tableFixedColumns={fixedCols}
                    measurements={measurements}
                    setMeasurements={setMeasurements}
                    tableFixedRows={staticTableRows}
                    handlePagination={handlePagination}
                    total={total}
                  />
                )}
                {statistics.length > 0 && (
                  <PacketStatistics
                    statistics={statistics}
                    params={allParams}
                  />
                )}
              </>
            )}
          </>
        )}
      </Flex>
    </>
  );
};
