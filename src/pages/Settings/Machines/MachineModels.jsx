import { Button, Flex, Form, Select } from "antd";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { StandartTable } from "../../../components/UI/StandartTable/StandartTable";
import { routes } from "../../../consts";
import { StandartFilter } from "../../../components/UI/Filters/StandartFilter/StandartFilter";
import { selectCurrentLang } from "../../../features/CurrentLang/currentLang";
import { getMachineModels } from "../../../http/machineModelsApi";
import { CustomModal } from "../../../components/Modal/CustomModal";
import { Search } from "../../../components/UI/Search/Search";
import { useInfiniteQuery, useQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";
import { useTranslation } from "react-i18next";
import { getBrands } from "../../../http/brandsApi";
import { getMachineTypes } from "../../../http/machineTypeApi";

export const MachineModels = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const [query, setQuery] = useState("");

  const { t } = useTranslation();
  const currentLang = useSelector(selectCurrentLang);
  const navigate = useNavigate();

  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleChildModelCreate = ({ machineModel }) => {
    navigate(routes.CREATECHILDMODEL, { state: machineModel });
  };

  const columns = useMemo(
    () => [
      {
        title: t("settings.machines.machine_models.columns.brand"),
        dataIndex: "brandName",
        key: "brand",
      },
      {
        title: t("settings.machines.machine_models.columns.name"),
        dataIndex: "name",
        key: "name",
      },
      {
        title: t("settings.machines.machine_models.columns.type"),
        dataIndex: "typeName",
        key: "type",
      },
      {
        title: t("settings.machines.machine_models.columns.parent"),
        dataIndex: "parentName",
        key: "parent",
      },
    ],
    []
  );

  const buttons = useMemo(
    () => [
      { name: t("buttons.add.model"), link: routes.CREATEMACHINE },
      { name: t("buttons.add.parent_model"), handler: handleModalOpen },
      { name: t("buttons.machine_types"), link: routes.MACHINETYPES },
    ],
    [currentLang]
  );

  const {
    isLoading,
    isError,
    error,
    isSuccess,
    data,
    remove,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ["allMachineModels", query],
    () => getMachineModels(query),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.next !== null) {
          const url = new URL(lastPage.next);
          const nextPage = url.searchParams.get("page");
          setQuery((prev) => `page=${nextPage}${prev ? `&${prev}` : ""}`);
        }
        return undefined;
      },
    }
  );

  const machineModels = useMemo(
    () =>
      isSuccess
        ? data.pages.flatMap((page) =>
            page.results.map((machineModel) => ({
              key: machineModel.id,
              id: machineModel.id,
              brandName: machineModel.brand.name,
              name: machineModel.name,
              typeName:
                machineModel.type.name[currentLang] ||
                machineModel.type.name.en,
              parentName: machineModel.parent?.name || "-",
              link: machineModel.id + "/",
              brand: machineModel.brand,
              type: machineModel.type,
            }))
          )
        : [],
    [data]
  );

  useEffect(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage]);

  const {
    data: brandPages,
    // isLoading,
    isSuccess: isSuccessBrands,
    // isError,
    // error,
    remove: removeBrands,
    fetchNextPage: nextBrand,
    hasNextPage: hasNextBrand,
  } = useInfiniteQuery(
    "getBrands",
    ({ pageParam = 1 }) => getBrands(pageParam),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.next !== null) {
          const url = new URL(lastPage.next);
          const nextPage = url.searchParams.get("page");

          return `page=${nextPage}`;
        }
        return undefined;
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );
  useEffect(() => {
    if (hasNextBrand) {
      nextBrand();
    }
  }, [hasNextBrand]);

  const brands = useMemo(
    () => isSuccessBrands && brandPages.pages.flatMap((page) => page.results),
    [brandPages]
  );

  const {
    data: typePages,
    // isLoading,
    isSuccess: isSuccessTypes,
    // isError,
    // error,
    remove: removeTypes,
    fetchNextPage: nextTypes,
    hasNextPage: hasNextTypes,
  } = useInfiniteQuery(
    "getBrands",
    ({ pageParam = 1 }) => getMachineTypes(pageParam),
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.next !== null) {
          const url = new URL(lastPage.next);
          const nextPage = url.searchParams.get("page");

          return `page=${nextPage}`;
        }
        return undefined;
      },
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );
  useEffect(() => {
    if (hasNextTypes) {
      nextTypes();
    }
  }, [hasNextTypes]);

  const types = useMemo(
    () => isSuccessTypes && typePages.pages.flatMap((page) => page.results),
    [typePages]
  );

  const filterItems = useMemo(() => {
    return [
      {
        key: "Order by",
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
      brands.length > 0 && {
        key: "Brand",
        type: "brand_id",
        label: t("filter.by.brand"),
        children: (
          <StandartFilter.Checkbox
            buttons={brands.map((brand) => ({
              value: brand.id,
              children: <p>{brand.name}</p>,
            }))}
          />
        ),
      },
      types.length > 0 && {
        key: "Type of Machine",
        type: "type",
        label: t("filter.by.type"),
        children: (
          <StandartFilter.Checkbox
            buttons={types.map((type) => ({
              value: type.id,
              children: <p>{type.name}</p>,
            }))}
          />
        ),
      },
    ].filter(Boolean);
  }, [data, brands, types]);

  const handlePagination = useCallback((currentPage) => {
    if (currentPage % 10 === 0) {
      data.next && setQuery(data.next.split("?")[1]);
    }
  }, []);

  useEffect(() => {
    return () => {
      remove();
      removeBrands();
      removeTypes();
    };
  }, []);

  return (
    <>
      <CustomModal
        title={t("settings.machines.machine_models.title")}
        open={modalOpen}
        onClose={handleModalClose}
      >
        <Form
          style={{ width: "60%" }}
          layout="vertical"
          onFinish={handleChildModelCreate}
        >
          <Form.Item
            name="machineModel"
            label={t("labels.machine_model")}
            rules={[{ required: true, message: t("rules.machine_model") }]}
          >
            {isSuccess && (
              <Select
                placeholder={t("placeholders.machine_model")}
                style={{ width: "100%" }}
              >
                {machineModels.map((machine) => (
                  <Select.Option key={machine.id} value={machine.id}>
                    {machine.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" block htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </CustomModal>

      <PageHeader title="Machine models" buttons={buttons} margin />
      <Flex gap="large" justify="space-between">
        {isLoading && <Loader />}
        {isError && <Error errorMsg={error.message} />}
        {isSuccess && (
          <StandartTable
            items={machineModels}
            columns={columns}
            handlePagination={handlePagination}
          />
        )}

        <StandartFilter filterItems={filterItems} setQuery={setQuery} />
      </Flex>
    </>
  );
};
