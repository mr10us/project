import { useState, useEffect, useCallback, useMemo } from "react";
import { Flex, Spin, message } from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StandartTable } from "../../../components/UI/StandartTable/StandartTable";
import { routes } from "../../../consts";
import { StandartFilter } from "../../../components/UI/Filters/StandartFilter/StandartFilter";
import { getCuttingFluids } from "../../../http/cuttingFluidApi";
import { useQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";

export const CFModels = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { t } = useTranslation();
  const currentLang = useGetCurrentLang();

  const { isLoading, isError, isSuccess, error, data, remove } = useQuery(
    ["getMixers", query, page],
    () => getCuttingFluids(query),
    { keepPreviousData: true }
  );
  const cfModels = useMemo(
    () =>
      isSuccess
        ? data.results.map((cfModel) => ({
            key: cfModel.id,
            id: cfModel.id,
            brandName: cfModel.brand.name,
            brand: cfModel.brand,
            link: cfModel.id + "/",
            name: cfModel.name,
            parentName: cfModel.parent?.name || "-",
          }))
        : [],
    [isSuccess, data]
  );

  const columns = useMemo(
    () => [
      {
        title: t("settings.cf.columns.brand"),
        dataIndex: "brandName",
        key: "brand",
      },
      {
        title: t("settings.cf.columns.name"),
        dataIndex: "name",
        key: "name",
      },
      {
        title: t("settings.cf.columns.parent"),
        dataIndex: "parentName",
        key: "parent",
      },
    ],
    [currentLang]
  );

  const buttons = [{ name: t("buttons.add.model"), link: routes.CREATECFM }];

  const filterItems = useMemo(
    () =>
      [
        {
          key: "ordering",
          label: t("filter.by.order"),
          type: "ordering",
          children: (
            <StandartFilter.Radio
              buttons={[
                { value: "+brand", name: t("filter.options.+brand") },
                { value: "-brand", name: t("filter.options.-brand") },
                { value: "+name", name: t("filter.options.+name") },
                { value: "-name", name: t("filter.options.-name") },
              ]}
            />
          ),
        },
        cfModels.length > 0 && {
          key: "brand",
          label: t("filter.by.brand"),
          type: "brand_id",
          children: (
            <StandartFilter.Checkbox
              buttons={cfModels.map((cfModel) => ({
                value: cfModel.brand.id,
                children: <p>{cfModel.brand.name}</p>,
              }))}
            />
          ),
        },
      ].filter(Boolean),
    [isSuccess]
  );

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader
        title={t("settings.cf.title")}
        buttons={buttons}
        data-page="customers"
        margin
      />
      <Flex gap={"large"} justify="space-between">
        {isLoading && <Loader />}
        {isError && <Error errorMsg={error.message} />}
        {isSuccess && <StandartTable items={cfModels} columns={columns} />}
        <StandartFilter filterItems={filterItems} setQuery={setQuery} />
      </Flex>
    </>
  );
};
