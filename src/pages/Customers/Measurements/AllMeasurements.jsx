import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { FileExcelOutlined } from "@ant-design/icons";
import { getMeasurements } from "../../../http/measurementsApi";
import { PacketStatistics } from "../../../components/PacketStatistics";
import { App, Flex } from "antd";
import { MeasurementTable } from "../../../components/MeasurementTable";
import { Loader } from "../../../components/Loader";
import { useInfiniteQuery, useQuery } from "react-query";
import { CustomEmpty } from "../../../components/UI/CustomEmpty";
import { StandartFilter } from "../../../components/UI/Filters/StandartFilter/StandartFilter";
import { getCustomerMachines } from "../../../http/customerMachinesApi";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { getMachineModels } from "../../../http/machineModelsApi";
import { useHandlePagination } from "../../../hooks/useHandlePagination";
import { useGetTotalPages } from "../../../hooks/useGetTotalPages";
import { Error } from "../../../components/Error";
import { useGetLocale } from "../../../hooks/useGetLocale";
import { useTranslation } from "react-i18next";
import { getLocaleDate } from "../../../utils/dateHelper";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";
import { checkIfPercent } from "../../../utils/Parameters/checkIfPercent";
import { numberFormatToString } from "../../../utils/numberFormat";
import { CalcPercents } from "../../../utils/Parameters/CalcPercents";
import { PDFViewer } from "../../../components/PDFViewer";
import { ExportToPDF } from "../../../components/ExportToPDF";
import { ExportToExcel } from "../../../components/ExportToExcel";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";

export const AllMeasurements = () => {
  const [statistics, setStatistics] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  const [query, setQuery] = useState("");

  const { t } = useTranslation();
  const customerID = useGetCustomerID();
  const locale = useGetLocale();
  const currentLang = useGetCurrentLang();
  const { width } = useGetCurrentSize();

  const allParams = useMemo(() => {
    return measurements.map((item) => item.parameters);
  }, [measurements]);

  const fixedCols = [
    { name: "id", title: t("customer.measurements.all.columns.id") },
    { name: "model", title: t("customer.measurements.all.columns.model") },
    { name: "created_at", title: t("customer.measurements.all.columns.date") },
  ];

  const staticTableRows = measurements.map((item) => ({
    id: item.machine.internal_number,
    model: `${item.machine_model.brand.name} ${item.machine_model.name}`,
    created_at: getLocaleDate(item.created_at, locale),
  }));

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

  const {
    isSuccess: isSuccessFetchedMachines,
    data: fetchedMachines,
    remove: removeFetchedMachines,
  } = useQuery(["getMachines"], () => getCustomerMachines(customerID));
  const {
    isSuccess: isSuccessFetchedModels,
    data: fetchedModels,
    remove: removeFetchedModels,
  } = useQuery(["getModels"], () => getMachineModels());

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
    [isSuccess, query, currentLang, currentPage, width]
  );

  const filterItems = useMemo(
    () => [
      {
        key: "ordering",
        label: t("filter.by.order"),
        type: "ordering",
        children: (
          <StandartFilter.Radio
            buttons={[
              { value: "-created_at", name: t("filter.options.+date") },
              { value: "+created_at", name: t("filter.options.-date") },
              { value: "+model", name: t("filter.options.+model") },
              { value: "-model", name: t("filter.options.-model") },
            ]}
          />
        ),
      },
      {
        key: "date_range",
        label: t("filter.by.date"),
        type: "date_range",
        children: <StandartFilter.RangeDatePicker />,
      },
      {
        key: "machine",
        label: t("filter.by.machine"),
        type: "machine_id",
        children: (
          <StandartFilter.Checkbox
            buttons={
              isSuccessFetchedMachines
                ? fetchedMachines.results.map((machine) => ({
                    value: machine.id,
                    children: <p>{`ID ${machine.internal_number}`}</p>,
                  }))
                : []
            }
          />
        ),
      },
      {
        key: "model",
        label: t("filter.by.models"),
        type: "model_id",
        children: (
          <StandartFilter.Checkbox
            buttons={
              isSuccessFetchedModels
                ? fetchedModels.results.map((model) => ({
                    value: model.id,
                    children: <p>{`${model.brand.name} ${model.name}`}</p>,
                  }))
                : []
            }
          />
        ),
      },
    ],
    [fetchedMachines, fetchedModels, currentLang]
  );

  useEffect(() => {
    return () => {
      remove();
      removeFetchedMachines();
      removeFetchedModels();
    };
  }, []);

  return (
    <>
      <PageHeader
        title={t("customer.measurements.all.title")}
        buttons={buttons}
        margin
        size="large"
      />
      {isLoading && <Loader />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && (
        <>
          <div style={{ marginBottom: 40 }}>
            <StandartFilter
              filterItems={filterItems}
              collapseSize={2000}
              setQuery={setQuery}
              setSequence={setMeasurements}
            />
          </div>
          <Flex vertical gap="large">
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
              <PacketStatistics statistics={statistics} params={allParams} />
            )}
            {statistics.length === 0 && measurements.length === 0 && (
              <CustomEmpty />
            )}
          </Flex>
        </>
      )}
    </>
  );
};
