import { useCallback, useEffect, useMemo, useState } from "react";
import { Flex } from "antd";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { useGetCurrentPage } from "../../../hooks/useGetCurrentPage";
import { roles, routes } from "../../../consts";
import { CustomerUsersFilter } from "../../../components/CustomerUsersFilter";
import { CustomerUsersTable } from "../../../components/CustomerUsersTable";
import { Outlet } from "react-router-dom";
import { getUsers } from "../../../http/usersApi";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { useQuery } from "react-query";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";
import { useGetPermissions } from "../../../hooks/useGetParmissions";
import { ROCustomerUsers } from "../../../components/ReadOnlyPages/ROCustomerUsers";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";
import { useTranslation } from 'react-i18next';

export const CustomerUsers = () => {
  const [query, setQuery] = useState("");

  const { t } = useTranslation();
  const { width } = useGetCurrentSize();
  const { role } = useGetPermissions();
  const customerID = useGetCustomerID();

  const { isLoading, isError, error, isSuccess, data, remove } = useQuery(
    ["customerUsers", query],
    () => getUsers(`available_customers=${customerID}&` + query)
  );
  const users = useMemo(
    () => (isSuccess ? data.results : []),
    [isSuccess, data]
  );

  const handlePagination = useCallback((currentPage) => {
    if (currentPage % 10 === 0) {
      data.next && setQuery(data.next.split("?")[1]);
    }
  }, []);

  useEffect(() => {
    return () => remove();
  }, []);

  if (useGetCurrentPage() !== "users") {
    return <Outlet />;
  }

  if (role !== roles.admin.toLowerCase())
    return (
      <ROCustomerUsers
        isLoading={isLoading}
        isError={isError}
        error={error}
        isSuccess={isSuccess}
        users={users}
        setQuery={setQuery}
      />
    );

  return (
    <>
      <PageHeader
        title={t("customer.users.title")}
        buttons={[{ name: t("buttons.add.user"), link: routes.ADDCUSTOMERUSER }]}
        margin
      />
      {/* <Search options={[]} suffix style={{ width: 200, marginBottom: 40 }} /> */}
      <Flex
        gap="large"
        justify="space-between"
        style={width < 1000 ? { flexDirection: "column-reverse" } : {}}
      >
        {isLoading && <Loader />}
        {isError && <Error errorMsg={error.message} />}
        {isSuccess && (
          <CustomerUsersTable
            users={users}
            handlePagination={handlePagination}
          />
        )}
        <CustomerUsersFilter setQuery={setQuery} />
      </Flex>
    </>
  );
};
