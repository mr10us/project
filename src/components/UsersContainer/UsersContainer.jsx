import { useState, useEffect, useMemo, useCallback } from "react";
import { Flex, App } from "antd";
import { useTranslation } from "react-i18next";
import { Search } from "../UI/Search/Search";
import { UsersFilter } from "../UI/Filters/UsersFilter/UsersFilter";
import { AddUserModal } from "../Modal/AddUserModal/AddUserModal";
import { UsersContent } from "../UsersContent/UsersContent";
import { PageHeader } from "../PageHeader/PageHeader";
import { getUsers } from "../../http/usersApi";
import { getUserName } from "../../utils/Users/getUserName";
import { useQuery } from "react-query";
import { Error } from "../Error";
import { CustomEmpty } from "../UI/CustomEmpty";
import { Loader } from "../Loader";
import { StandartFilter } from "../UI/Filters/StandartFilter/StandartFilter";
import { Evaluation } from "../Evaluation";
import { useGetCurrentLang } from "../../hooks/useGetCurrentLang";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

export const UsersContainer = () => {
  const [openModal, setOpenModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("role=1,2");

  const { width } = useGetCurrentSize();
  const currentLang = useGetCurrentLang();
  const { t } = useTranslation();

  const filterItems = useMemo(
    () => [
      {
        key: "ordering",
        label: t("filter.by.order"),
        type: "ordering",
        children: (
          <StandartFilter.Radio
            buttons={[
              { value: "+name", name: t("filter.options.+name") },
              { value: "-name", name: t("filter.options.-name") },
              { value: "+level", name: t("filter.options.+level") },
              { value: "-level", name: t("filter.options.-level") },
            ]}
          />
        ),
      },
      {
        key: "is_active",
        label: t("filter.by.status"),
        type: "is_active",
        children: (
          <StandartFilter.Radio
            buttons={[
              { value: true, name: t("filter.options.active") },
              { value: false, name: t("filter.options.inactive") },
              { value: "all", name: t("filter.options.all") },
            ]}
          />
        ),
      },
      {
        key: "notify_level",
        label: t("filter.by.level"),
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
    ],
    [currentLang]
  );

  const showModal = () => {
    setOpenModal(true);
  };

  const { isLoading, isError, error, isSuccess, data, remove } = useQuery(
    ["getUsers", query],
    () => getUsers(query)
  );

  useEffect(() => {
    if (isSuccess) {
      const fullUserArr = data.results
        .map((user) => ({
          ...user,
          key: user.id,
          name: getUserName(user),
          phone_number: user.phone_number || "-",
          notify_level: <Evaluation type={user.notify_level} text />,
          link: `${user.id}/`,
        }))
        .filter((user) => user.is_staff === true);
      if (isSuccess) {
        if (users.length === 0) setUsers(fullUserArr);
        else {
          const isOld = Boolean(
            data.results.find((user) => user.id === users[0].id)
          );
          if (!isOld) setUsers((prev) => [...prev, ...fullUserArr]);
        }
      }
    }
  }, [data]);

  const handlePagination = useCallback((currentPage) => {
    if (currentPage % 10 === 0) {
      data.next && setQuery(data.next.split("?")[1]);
    }
  }, []);

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <AddUserModal open={openModal} setOpen={setOpenModal} />

      <Flex vertical gap="25px">
        <PageHeader
          title={t("users.title")}
          buttons={[{ name: t("buttons.add.default"), handler: showModal }]}
        />
        {/* <Search
          suffix
          options={users.map((user) => ({ label: user.name, value: user.id }))}
          style={{ width: "200px" }}
        /> */}
        <Flex
          justify="space-between"
          gap={"large"}
          style={width < 1000 ? { flexDirection: "column-reverse" } : {}}
        >
          {isLoading && <Loader />}
          {isError && <Error errorMsg={error.message} />}
          {isSuccess ? (
            <UsersContent users={users} handlePagination={handlePagination} />
          ) : (
            <CustomEmpty />
          )}
          <StandartFilter
            filterItems={filterItems}
            setQuery={setQuery}
            collapseSize={1000}
          />
        </Flex>
      </Flex>
    </>
  );
};
