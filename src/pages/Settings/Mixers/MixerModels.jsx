import { useState, useEffect, useMemo, useCallback } from "react";
import { Flex, Spin, message } from "antd";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StandartTable } from "../../../components/UI/StandartTable/StandartTable";
import { routes } from "../../../consts";
import { StandartFilter } from "../../../components/UI/Filters/StandartFilter/StandartFilter";
import { getMixers } from "../../../http/mixersApi";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { useQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";
import { useTranslation } from "react-i18next";

export const MixerModels = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { t } = useTranslation();
  const currentLang = useSelector(selectCurrentLang);

  const { isLoading, isError, isSuccess, error, data, remove } = useQuery(
    ["getMixers", query, page],
    () => getMixers(query),
    { keepPreviousData: true }
  );

  const buttons = useMemo(
    () => [{ name: t("buttons.add.model"), link: routes.CREATEMIXER }],
    [currentLang]
  );

  const columns = useMemo(
    () => [
      {
        title: t("settings.mixers.columns.brand"),
        dataIndex: "brandName",
        key: "brand",
        width: "20%",
      },
      {
        title: t("settings.mixers.columns.name"),
        dataIndex: "name",
        key: "name",
        width: "30%",
      },
      {
        title: t("settings.mixers.columns.parent"),
        dataIndex: "parentName",
        key: "parent",
        width: "40%",
      },
    ],
    [currentLang]
  );

  const mixers = useMemo(
    () =>
      isSuccess
        ? data.results.map((mixer) => ({
            key: mixer.id,
            brandName: mixer.brand.name,
            brand: mixer.brand,
            link: mixer.id + "/",
            name: mixer.name,
            parentName: mixer.parent?.name || "-",
          }))
        : [],
    [isSuccess, data]
  );

  const handlePagination = useCallback((currentPage) => {
    if (currentPage % 10 === 0) {
      data.next && setQuery(data.next.split("?")[1]);
    }
  }, []);

  const filterItems = useMemo(() => {
    return [
      {
        key: "ordering",
        type: "ordering",
        label: t("filter.by.order"),
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
      mixers?.length > 0 && {
        key: "brand",
        type: "brand_id",
        label: t("filter.by.brand"),
        children: (
          <StandartFilter.Checkbox
            buttons={mixers.map((mixer) => ({
              value: mixer.brand.id,
              children: <p>{mixer.brand.name}</p>,
            }))}
          />
        ),
      },
    ].filter(Boolean);
  }, [data, currentLang]);

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader
        title={t("settings.mixers.title")}
        buttons={buttons}
        data-page="customers"
        margin
      />
      <Flex gap={"large"} justify="space-between">
        {isLoading && <Loader />}
        {isError && <Error errorMsg={error.message} />}
        {isSuccess && (
          <StandartTable
            items={mixers}
            columns={columns}
            handlePagination={handlePagination}
          />
        )}

        <StandartFilter filterItems={filterItems} setQuery={setQuery} />
      </Flex>
    </>
  );
};
