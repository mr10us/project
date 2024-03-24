import styles from "../Filters.module.css";
import { Collapse, Radio, Space } from "antd";

export default function CustomersFilter() {
  return (
    <div className={styles.container}>
      <h5 className="filterHeader" style={{padding: "16px"}}>Filter by</h5>
      <Collapse
        ghost
        expandIconPosition="end"
        items={[
          {
            key: "1",
            label: "Order by",
            children: (
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="top">Name &uarr;</Radio>
                  <Radio value="bottom">Name &darr;</Radio>
                </Space>
              </Radio.Group>
            ),
          },
          {
            key: "2",
            label: "Status",
            children: (
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="active">Active</Radio>
                  <Radio value="inactive">Inactive</Radio>
                  <Radio value="all">All</Radio>
                </Space>
              </Radio.Group>
            ),
          },
        ]}
      />
    </div>
  );
}
