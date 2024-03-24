import { BugOutlined } from "@ant-design/icons";
import styles from "../Filters.module.css";
import { Collapse, Radio, Space, Checkbox, Flex, Button } from "antd";

export const UsersFilter = () => {
  const sendRequest = () => {
    console.log("request sent")
  }
  const reset = () => {
    console.log("reset")
  }
  return (
    <div className={styles.container}>
      <Flex justify="space-between" align="center" className="filterHeader">
        <h5>Filter by</h5>
        <Space size="small">
          <Button type="primary" onClick={sendRequest}>Apply</Button>
          <Button type="primary" danger onClick={reset}>Reset</Button>
        </Space>
      </Flex>
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
                  <Radio value="-name">Name &uarr;</Radio>
                  <Radio value="+name">Name &darr;</Radio>
                  <Radio value="-level">Level &uarr;</Radio>
                  <Radio value="+level">Level &darr;</Radio>
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
                </Space>
              </Radio.Group>
            ),
          },
          {
            key: "3",
            label: "Level",
            children: (
              <Checkbox.Group>
                <Space direction="vertical">
                  <Checkbox value="good">
                    <div className="circleContainer">
                      <div className="circle bg-c_good"></div>
                      <p>Good</p>
                    </div>
                  </Checkbox>
                  <Checkbox value="suspicious">
                    <div className="circleContainer">
                      <div className="circle bg-c_suspicious"></div>
                      <p>Suspicious</p>
                    </div>
                  </Checkbox>
                  <Checkbox value="warning">
                    <div className="circleContainer">
                      <div className="circle bg-c_warning"></div>
                      <p>Warning</p>
                    </div>
                  </Checkbox>
                  <Checkbox value="critical">
                    <div className="circleContainer">
                      <div className="circle bg-c_critical"></div>
                      <p>Critical</p>
                    </div>
                  </Checkbox>
                </Space>
              </Checkbox.Group>
            ),
          },
        ]}
      />
    </div>
  );
};
