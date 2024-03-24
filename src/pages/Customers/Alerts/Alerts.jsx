import { useCallback, useEffect, useMemo, useState } from "react";
import { Flex } from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StandartTable } from "../../../components/UI/StandartTable/StandartTable";
import { StandartFilter } from "../../../components/UI/Filters/StandartFilter/StandartFilter";
import { Evaluation } from "../../../components/Evaluation";
import { EllipsisTextPopover } from "../../../components/EllipsisTextPopover";
import { getAlerts } from "../../../http/alertsApi";
import { useInfiniteQuery, useQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { Outlet, useLocation } from "react-router-dom";
import { useGetCurrentPage } from "../../../hooks/useGetCurrentPage";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";
import { useGetTotalPages } from "../../../hooks/useGetTotalPages";
import { useHandlePagination } from "../../../hooks/useHandlePagination";
import { useGetLocale } from "../../../hooks/useGetLocale";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { useTranslation } from "react-i18next";
import { SearchInput } from "../../../components/SearchInput";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";

export const Alerts = () => {
  const [query, setQuery] = useState("");
  const [alerts, setAlerts] = useState([]);

  const { pathname } = useLocation();
  const { width } = useGetCurrentSize();
  const currentPage = useGetCurrentPage();
  const customerID = useGetCustomerID();
  const locale = useGetLocale();
  const { t } = useTranslation();
  const currentLang = useGetCurrentLang();

  const columns = useMemo(
    () => [
      {
        title: t("customer.alerts.columns.date"),
        dataIndex: "created_at",
        key: "created_at",
        render: (date) => {
          return new Date(date).toLocaleString(locale);
        },
      },
      {
        title: t("customer.alerts.columns.level"),
        dataIndex: "danger_level",
        key: "danger_level",
        render: (level) => <Evaluation type={level} text />,
      },
      {
        title: t("customer.alerts.columns.relation"),
        dataIndex: "relation",
        key: "relation",
      },
      {
        title: t("customer.alerts.columns.title"),
        dataIndex: "title",
        key: "title",
        render: (text) => <EllipsisTextPopover text={text} />,
      },
      {
        title: t("customer.alerts.columns.description"),
        dataIndex: "content",
        key: "content",
        // width: "20%",
        render: (text) => <EllipsisTextPopover text={text} />,
      },
    ],
    [currentLang]
  );

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
    ["allAlerts", query],
    ({ pageParam = 1 }) => getAlerts(pageParam, query, customerID),
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

  const filterItems = useMemo(
    () => [
      {
        key: 1,
        label: t("filter.by.order"),
        type: "ordering",
        children: (
          <StandartFilter.Radio
            buttons={[
              { value: "-created_at", name: t("filter.options.+date") },
              { value: "+created_at", name: t("filter.options.-date") },
              { value: "+level", name: t("filter.options.+packet_level") },
              { value: "-level", name: t("filter.options.-packet_level") },
            ]}
          />
        ),
      },
      {
        key: 2,
        label: t("filter.by.level"),
        type: "danger_level",
        children: (
          <StandartFilter.Checkbox
            buttons={[
              { value: "good", children: <Evaluation type="good" text /> },
              {
                value: "suspicious",
                children: <Evaluation type="suspicious" text />,
              },
              {
                value: "warning",
                children: <Evaluation type="warning" text />,
              },
              {
                value: "critical",
                children: <Evaluation type="critical" text />,
              },
            ]}
          />
        ),
      },
      {
        key: 3,
        label: t("filter.by.date"),
        type: "date_range",

        children: <StandartFilter.DateRange />,
      },
    ],
    [currentLang]
  );

  const total = useGetTotalPages(data);
  const { handlePagination } = useHandlePagination(fetchNextPage, hasNextPage);

  // const validAlerts = useMemo(
  //   () =>
  //     alerts.map((alert) => ({
  //       ...alert,
  //       key: alert.id,
  //       link: pathname + (alert.key || alert.id),
  //       relation: alert.machine?.id
  //         ? String(
  //             `ID ${alert.machine?.internal_number} (${alert.machine?.model?.brand?.name} ${alert.machine?.model?.name})`
  //           )
  //         : "Customer",
  //     })),
  //   []
  // );
  useEffect(() => {
    if (!isSuccess) return;

    setAlerts(
      data.pages
        .map((page) =>
          page.results.map((alert) => ({
            ...alert,
            key: alert.id,
            link: pathname + (alert.key || alert.id),
            relation: alert.machine?.id
              ? String(
                  `ID ${alert.machine?.internal_number} (${alert.machine?.model?.brand?.name} ${alert.machine?.model?.name})`
                )
              : "Customer",
          }))
        )
        .flat()
    );
  }, [data]);

  useEffect(() => {
    return () => remove();
  }, []);

  if (currentPage !== "alerts") return <Outlet />;

  return (
    <>
      <PageHeader title={t("customer.alerts.title")} margin />
      {isSuccess && (
        <SearchInput
          placeholder={t("placeholders.alert")}
          hint={t("hints.alerts")}
          setQuery={setQuery}
        />
      )}
      <Flex
        gap="large"
        justify="space-between"
        style={width < 1000 ? { flexDirection: "column-reverse" } : {}}
      >
        <div style={width < 1000 ? { width: "100%" } : { width: "70%" }}>
          {isLoading && <Loader />}
          {isError && <Error errorMsg={error.message} />}
          {isSuccess && (
            <StandartTable
              columns={columns}
              items={alerts}
              handlePagination={handlePagination}
              total={total}
            />
          )}
        </div>
        <div style={width < 1000 ? { width: "100%" } : { width: "30%" }}>
          <StandartFilter
            filterItems={filterItems}
            setQuery={setQuery}
            collapseSize={1000}
          />
        </div>
      </Flex>
    </>
  );
};
