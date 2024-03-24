import styles from "./CustomersContent.module.css";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, List } from "antd";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../features/Customer/customer";
import { routes } from "../../consts";

export const CustomersContent = ({ customers }) => {
  const validCustomers = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
  }));

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const doPaginate = validCustomers?.length > 10;

  const handleNavigate = (customer) => {
    dispatch(setCustomer(customer));
    navigate(`${routes.CUSTOMERS}${customer.id}`);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          List: {
            titleMarginBottom: 0,
          },
          Pagination: {
            itemBg: "#000",
            itemInputBg: "#000",
            itemLinkBg: "#000",
          },
        },
      }}
    >
      <List
      
        className={styles.container}
        pagination={
          doPaginate && {
            position: "bottom",
            align: "start",
            total: validCustomers.length || 10,
            showSizeChanger: false,
          }
        }
        dataSource={validCustomers}
        renderItem={(customer) => (
          <List.Item style={{ borderRadius: 6, padding: 0 }}>
            <List.Item.Meta
              title={
                <div
                  onClick={() => handleNavigate(customer)}
                  style={{ padding: "12px 16px", cursor: "pointer" }}
                >
                  {customer.name}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </ConfigProvider>
  );
};
