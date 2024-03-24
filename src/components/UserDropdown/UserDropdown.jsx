import { Portal } from "react-dom";
import { useState } from "react";
import { Space, Avatar, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

const UserDropdown = ({ items }) => {
  const [visible, setVisible] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div>
      <a onClick={handleClick}>
        <Space>
          <Avatar size="large" />
          {"Entony N."}
          <DownOutlined />
        </Space>
      </a>

      <Portal>
        {visible && (
          <Dropdown
            placement="bottom"
            menu={{ items }}
            trigger={["click"]}
            onClose={handleClose}
          >
          </Dropdown>
        )}
      </Portal>
    </div>
  );
};

export default UserDropdown;