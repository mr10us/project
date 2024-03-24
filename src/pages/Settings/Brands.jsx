import { useState, useEffect, useMemo } from "react";
import { Button, Flex, Form, Input, Space } from "antd";
import { CustomModal } from "../../components/Modal/CustomModal";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { StandartList } from "../../components/UI/StandartList/StandartList";
import {
  getBrands,
  createBrand,
  editBrand,
  removeBrand,
} from "../../http/brandsApi";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import { Loader } from "../../components/Loader";
import { Error } from "../../components/Error";
import { useTranslation } from "react-i18next";

export const Brands = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selected, setSelected] = useState({});

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [addBrandForm] = Form.useForm();
  const [editBrandForm] = Form.useForm();

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
    if (hasNextPage) {
      nextBrand();
    }
  }, [hasNextPage]);

  const brands = useMemo(
    () =>
      isSuccess &&
      data.pages.flatMap((page) =>
        page.results.map((brand) => ({ title: brand.name, id: brand.id }))
      ),
    [data]
  );

  const { mutateAsync: handleEditBrand } = useMutation(
    async () => {
      const updatedName = editBrandForm.getFieldValue("name");
      await editBrand(selected.id, updatedName);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["getBrands"]);
        setOpenEdit(false);
        setSelected({});
      },
    }
  );

  const { mutateAsync: handleCreateBrand } = useMutation(
    async () => {
      const brandName = addBrandForm.getFieldValue("name");
      await createBrand(brandName);
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries("getBrands");
        setOpenAdd(false);
        setSelected({});
      },
      onError: (e) => console.log(e),
    }
  );

  const { mutateAsync: handleRemoveBrand } = useMutation(
    async () => {
      await removeBrand(selected.id);
    },
    {
      onSuccess: async () => {
        setOpenEdit(false);
        await queryClient.invalidateQueries(["getBrands"]);
      },
    }
  );

  const showAddModal = () => {
    addBrandForm.setFieldValue("name", "");
    setOpenAdd(true);
  };

  const handleAddClose = () => {
    setSelected({});
    setOpenAdd(false);
  };

  const showEditModal = (item) => {
    setSelected({ value: item.title, id: item.id });
    editBrandForm.setFieldValue("name", item.title);
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const buttons = useMemo(
    () => [{ name: t("buttons.add.brand"), handler: showAddModal }],
    []
  );

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <CustomModal
        title={t("modals.brands.add.title")}
        open={openAdd}
        onClose={handleAddClose}
      >
        <Form layout="vertical" style={{ width: "100%" }} form={addBrandForm}>
          <Form.Item name="name" label={t("labels.name")}>
            <Input placeholder={t("placeholders.name")} />
          </Form.Item>

          <Flex align="center">
            <Button
              type="primary"
              block
              onClick={async () => {
                await handleCreateBrand();
              }}
              style={{ padding: "0 64px" }}
            >
              {t("buttons.add.default")}
            </Button>
          </Flex>
        </Form>
      </CustomModal>

      <CustomModal
        title={t("modals.brands.edit.title")}
        open={openEdit}
        onClose={handleEditClose}
      >
        <Form key={selected?.value} layout="vertical" form={editBrandForm}>
          <Form.Item name="name" label={t("labels.name")}>
            <Input placeholder={t("placeholders.name")} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              onClick={async () => {
                await handleEditBrand();
              }}
              style={{ padding: "0 64px" }}
            >
              {t("buttons.save")}
            </Button>
            <Button
              type="primary"
              danger
              onClick={async () => {
                await handleRemoveBrand();
              }}
              style={{ padding: "0 64px" }}
            >
              {t("buttons.delete")}
            </Button>
          </Space>
        </Form>
      </CustomModal>

      <PageHeader title={t("settings.brands.title")} buttons={buttons} margin />
      {isLoading && <Loader />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && <StandartList items={brands} setSelected={showEditModal} />}
    </>
  );
};
