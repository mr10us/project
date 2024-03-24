import { PageHeader } from "../PageHeader/PageHeader";
import { Flex } from "antd";
import { CustomerUsersFilter } from "../CustomerUsersFilter";
import { CustomerUsersTable } from "../CustomerUsersTable";
import { Loader } from "../Loader";
import { Error } from "../Error";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

export const ROCustomerUsers = ({
  isLoading,
  isError,
  error,
  isSuccess,
  users,
  setQuery,
}) => {
  const {width} = useGetCurrentSize();

  return (
    <>
      <PageHeader
        title="Users"
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
            readOnly
          />
        )}
        <CustomerUsersFilter setQuery={setQuery} />
      </Flex>
    </>
  );
};
