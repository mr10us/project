import { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Flex, Popover, Row, Select } from "antd";
import { Evaluation } from "../../../components/Evaluation";
import { StandartTable } from "../../../components/UI/StandartTable/StandartTable";
import { StandartFilter } from "../../../components/UI/Filters/StandartFilter/StandartFilter";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import createTableItem from "../../../utils/createTableItem";
import { _routes, alertLevels, routes } from "../../../consts";
import { getPackets } from "../../../http/packetsApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";
import { useGetTotalPages } from "../../../hooks/useGetTotalPages";
import { useHandlePagination } from "../../../hooks/useHandlePagination";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { useTranslation } from "react-i18next";
import { getLocaleDate } from "../../../utils/dateHelper";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";
import { useGetLocale } from "../../../hooks/useGetLocale";
import { SearchInput } from "../../../components/SearchInput";
import { useGetPermissions } from "../../../hooks/useGetParmissions";
import { PDFViewer } from "../../../components/PDFViewer";
import { ExportToPDF } from "../../../components/ExportToPDF";

const getCustomerAlert = (customerAlerts) => {
  const alerts = customerAlerts.filter((alert) => alert.machine === null);
  if (alerts.length > 0) return alerts[0].danger_level;
  return "none";
};

export const Packets = () => {
  const [query, setQuery] = useState("");

  const [packetList, setPacketList] = useState([]);

  const { t } = useTranslation();
  const { width } = useGetCurrentSize();
  const { role } = useGetPermissions();
  const { pathname } = useLocation();
  const customerID = useGetCustomerID();
  const navigate = useNavigate();
  const locale = useGetLocale();
  const currentLang = useGetCurrentLang();
  const canOverride = useMemo(() => role !== "guest", [role]);

  const buttons = useMemo(
    () =>
      canOverride
        ? [
            {
              name: t("buttons.create.packet"),
              link: routes.CUSTOMERPACKETCREATE,
            },
          ]
        : null,
    []
  );

  const columns = [
    {
      title: t("customer.packets.columns.date"),
      dataIndex: "date",
      align: "center",
      key: "date",
    },
    {
      title: t("customer.packets.columns.packet_level"),
      dataIndex: "level",
      align: "center",
      key: "level",
      render: (level) => <Evaluation type={level} text />,
    },
    {
      title: t("customer.packets.columns.measures"),
      dataIndex: "measures",
      align: "center",
      key: "measures",
      render: (text) => (
        <Popover content={text}>
          <span
            style={{
              display: "inline-block",
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </span>
        </Popover>
      ),
    },
    {
      title: t("customer.packets.columns.problem_machines"),
      dataIndex: "problem",
      align: "center",
      key: "problem",
      render: (text) => (
        <Popover content={text}>
          <span
            style={{
              display: "inline-block",
              maxWidth: 160,
              minWidth: 60,
              overflow: "hidden",
              wordBreak: "keep-all",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </span>
        </Popover>
      ),
    },
    {
      title: t("customer.packets.columns.customer_alert"),
      dataIndex: "alert",
      align: "center",
      key: "alert",
      render: (alert) => <Evaluation type={alert} text />,
    },
    width > 565
      ? {
          title: t("customer.packets.columns.preview_pdf"),
          dataIndex: "preview",
          key: "preview",
          render: (id) => <PDFViewer type="packet" id={id} showText={false} />,
        }
      : null,
    {
      title: t("customer.packets.columns.export_pdf"),
      dataIndex: "export",
      key: "export",
      align: "center",
      render: (id) => (
        <ExportToPDF type="packet" id={id} showText={false} fontSize={"1em"} />
      ),
    },
  ].filter(Boolean);

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
              {
                value: "+notify_level",
                name: t("filter.options.+notify_level"),
              },
              {
                value: "-notify_level",
                name: t("filter.options.-notify_level"),
              },
            ]}
          />
        ),
      },
      {
        key: "date_range",
        label: t("filter.by.date"),
        type: "date_range",
        children: <StandartFilter.DateRange />,
      },
      {
        key: "notify_level",
        label: t("filter.by.packet_level"),
        type: "notify_level",
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
        key: "contain_measurements",
        label: t("filter.by.measurements"),
        type: "contain_measurements",
        children: (
          <StandartFilter.Radio
            buttons={[
              { value: "all", name: t("filter.options.all") },
              { value: true, name: t("filter.options.+contain") },
              { value: false, name: t("filter.options.-contain") },
            ]}
          />
        ),
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
    ["getPackets", query],
    ({ pageParam = 1 }) => getPackets(pageParam, query, customerID),
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

  const total = useGetTotalPages(data);
  const { handlePagination } = useHandlePagination(fetchNextPage, hasNextPage);

  const packets = useMemo(
    () =>
      packetList.map((packet) => ({
        ...packet,
        link: pathname + packet.key,
      })),
    [packetList]
  );

  useEffect(() => {
    if (!isSuccess) return;

    const compareDates = (a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    };

    const sortedData = data.pages
      .map((page) =>
        page.results.toSorted(compareDates).map((packet) => {
          return [
            packet.id,
            getLocaleDate(packet.created_at, locale),
            packet.notify_level,
            packet.measurements_count > 0
              ? t("customer.packets.measures.+contain")
              : t("customer.packets.measures.-contain"),
            packet.alerts
              .filter((alert) => alert.machine !== null)
              .map(
                (alert) =>
                  alert.machine !== null &&
                  `ID ${alert.machine.internal_number} (${alert.machine.model.brand.name} ${alert.machine.model.name})`
              )
              .join(", ") || t("customer.packets.measures.-contain"),
            getCustomerAlert(packet.alerts),
            packet.id,
            packet.id,
          ];
        })
      )
      .flat();

    setPacketList(
      createTableItem(
        [
          "key",
          "date",
          "level",
          "measures",
          "problem",
          "alert",
          "preview",
          "export",
        ],
        sortedData
      )
    );
  }, [data]);

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader
        title={t("customer.packets.title")}
        size={"large"}
        buttons={buttons}
        margin
      />
      {isSuccess && (
        <SearchInput
          placeholder={t("placeholders.packets")}
          hint={t("hints.packets.search")}
          setQuery={setQuery}
        />
      )}
      <Flex
        gap="large"
        justify="space-between"
        style={width < 1000 ? { flexDirection: "column-reverse" } : {}}
      >
        <div className="content-container">
          {isLoading && <Loader />}
          {isError && <Error errorMsg={error.message} />}
          {isSuccess && (
            <StandartTable
              size={width > 768 ? "large" : "middle"}
              columns={columns}
              items={packets}
              handlePagination={handlePagination}
              total={total}
            />
          )}
        </div>
        <div className="standart-filter-container">
          <StandartFilter
            filterItems={filterItems}
            setQuery={setQuery}
            collapseSize={1000}
            setSequence={setPacketList}
          />
        </div>
      </Flex>
    </>
  );
};
