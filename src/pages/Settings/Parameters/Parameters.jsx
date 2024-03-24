import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Flex } from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StandartTable } from "../../../components/UI/StandartTable/StandartTable";
import { defaultOptions, routes } from "../../../consts";
import { StandartFilter } from "../../../components/UI/Filters/StandartFilter/StandartFilter";
import { getParameters } from "../../../http/parametersApi";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { useInfiniteQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";
import { useHandlePagination } from "../../../hooks/useHandlePagination";
import { useGetTotalPages } from "../../../hooks/useGetTotalPages";
import { useTranslation } from "react-i18next";
import { SearchInput } from "../../../components/SearchInput";

function createParameter(key, identifier, name, unit, type, link) {
  return {
    key: key,
    id: key,
    identifier: identifier,
    name: name,
    unit: unit,
    type: type,
    link: link,
  };
}

const getType = (typeID) => {
  const neededOption = defaultOptions.find((option) => option.key === typeID);
  return neededOption.label;
};

export const Parameters = () => {
  const [params, setParams] = useState([]);
  const [query, setQuery] = useState("");

  const currentLang = useSelector(selectCurrentLang);
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        title: t("settings.parameters.columns.identifier"),
        dataIndex: "identifier",
        key: "identifier",
      },
      {
        title: t("settings.parameters.columns.name"),
        dataIndex: "name",
        key: "name",
      },
      {
        title: t("settings.parameters.columns.unit"),
        dataIndex: "unit",
        key: "unit",
      },
      {
        title: t("settings.parameters.columns.type"),
        key: "type",
        dataIndex: "type",
      },
    ],
    [currentLang]
  );

  const filterItems = useMemo(
    () => [
      {
        key: "1",
        type: "ordering",
        label: t("filter.by.order"),
        children: (
          <StandartFilter.Radio
            buttons={[
              { value: "+name", name: t("filter.options.+name") },
              { value: "-name", name: t("filter.options.-name") },
              { value: "+type", name: t("filter.options.+type") },
              { value: "-type", name: t("filter.options.-type") },
            ]}
          />
        ),
      },
      {
        key: "2",
        type: "type",
        label: t("filter.by.type"),
        children: (
          <StandartFilter.Checkbox
            buttons={[
              {
                value: "1",
                children: <p>{t("filter.options.types.machine")}</p>,
              },
              {
                value: "3",
                children: <p>{t("filter.options.types.mixer")}</p>,
              },
              { value: "2", children: <p>{t("filter.options.types.cf")}</p> },
              {
                value: "4",
                children: <p>{t("filter.options.types.abstract")}</p>,
              },
            ]}
          />
        ),
      },
    ],
    [currentLang]
  );

  const buttons = useMemo(
    () => [{ name: t("buttons.add.parameter"), link: routes.ADDPARAMETER }],
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
    ["getParameters", query],
    ({ pageParam = 1 }) => getParameters(pageParam, query),
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

  useEffect(() => {
    if (!isSuccess) return;

    setParams(
      data.pages
        .map((page) =>
          // Map through pages

          page.results.map((param) => {
            // Map through one page results
            const paramName = param.name[currentLang] || param.name.en;
            const paramUnit = param.unit[currentLang] || param.unit.en;

            return createParameter(
              param.id,
              param.variable_name,
              paramName,
              paramUnit,
              getType(param.type),
              param.id + "/"
            );
          })
        )
        .flat()
    );
  }, [data]);

  const { handlePagination } = useHandlePagination(fetchNextPage, hasNextPage);

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader
        title={t("settings.parameters.title")}
        buttons={buttons}
        data-page="customers"
        margin
      />
      <SearchInput
        placeholder={t("placeholders.parameter")}
        setQuery={setQuery}
        hint={t("hints.parameters")}
      />
      <Flex gap="large" justify="space-between">
        {isLoading && <Loader />}
        {isError && <Error errorMsg={error.message} />}
        {isSuccess && (
          <StandartTable
            items={params}
            columns={columns}
            handlePagination={handlePagination}
            total={total}
          />
        )}

        <StandartFilter filterItems={filterItems} setQuery={setQuery} />
      </Flex>
    </>
  );
};
