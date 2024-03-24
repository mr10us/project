import { StandartTable } from "../UI/StandartTable/StandartTable";
import { StandartFilter } from "../UI/Filters/StandartFilter/StandartFilter";
import { PageHeader } from "../PageHeader/PageHeader";
import { Loader } from "../Loader";
import { Error } from "../Error";
import { Flex } from "antd";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

export const ROCustomerMachines = ({
  isLoading,
  isError,
  error,
  isSuccess,
  items,
  columns,
  filterItems,
  setQuery,
  handlePagination,
}) => {
  const { width } = useGetCurrentSize();

  return (
    <>
      <PageHeader title="Machines" margin />
      {/* <Search
        hint="You can search for machines by model name, customer ID"
        options={customerMachineSearchItems || []}
        suffix
        style={{ width: 300 }}
      /> */}
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
              items={items || []}
              columns={columns}
              handlePagination={handlePagination}
            />
          )}
        </div>
        <div className="standart-filter-container">
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
