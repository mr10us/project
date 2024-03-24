import { ConfigProvider, Table } from "antd";
import { useNavigate } from "react-router-dom";
import { isValidElement } from "react";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";

export const StandartTable = ({
  items,
  columns,
  handlePagination,
  size,
  pageSize = 10,
  sticky,
  total,
}) => {
  const navigate = useNavigate();
  const { width } = useGetCurrentSize();

  const handleNavigate = (item) => {
    // Checks if there any React Elements and deletes if true
    const filteredValues = Object.fromEntries(
      Object.entries(item).filter(([_, value]) => !isValidElement(value))
    );

    item?.link && navigate(item.link, { state: filteredValues });
  };
  const paginate = items?.length > 10;

  return (
    <ConfigProvider
      theme={{
        components: { Table: { cellFontSizeMD: width < 425 ? 12 : 14 } },
      }}
    >
      <Table
        sticky={sticky}
        size={size}
        columns={columns}
        dataSource={items}
        onRow={(item) => ({
          onClick: (e) => {
            if (
              e.target.className === "ant-flex css-jbrox ant-flex-align-center"
            )
              return;
            if (e.target.className === "ant-modal-wrap") return;
            if (
              ["svg", "path", "button"].includes(e.target.tagName.toLowerCase())
            )
              return;
            else handleNavigate(item);
          },
        })}
        style={{
          width: "100%",
        }}
        rowClassName={items && items[0]?.link ? "table-row-cursor-pointer" : ""}
        scroll={{ x: "max-content" }}
        pagination={
          paginate && {
            position: ["bottomLeft"],
            total: items.length || 10,
            showSizeChanger: false,
            pageSize: pageSize,
            onChange: handlePagination,
            showTotal: (_, ranges) =>
              total
                ? `${ranges[0]}-${ranges[1]} of ${total} records`
                : `${ranges[0]}-${ranges[1]}`,
          }
        }
      />
    </ConfigProvider>
  );
};
