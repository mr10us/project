import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Dropdown, Space, Avatar, Spin, Flex } from "antd";
import { routes } from "../consts";
import { logout } from "../http/authApi";
import { dropCurrentUser } from "../features/CurrentUser/currentUser";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";

export const UserMenu = () => {
  const { isSuccess, user, isLoading, isError, error } = useSelector(
    (state) => state.currentUser
  );

  const dispatch = useDispatch();
  const { width } = useGetCurrentSize();

  const handleLogOut = () => {
    dispatch(dropCurrentUser());
    logout();
  };

  const items = [
    {
      label: <Link to={routes.PROFILESETTINGS}>Settings</Link>,
      icon: <UserOutlined />,
      key: "0",
    },
    {
      label: (
        <Link to={routes.LOGIN} onClick={handleLogOut}>
          Log Out
        </Link>
      ),
      icon: <LogoutOutlined />,
      key: "1",
    },
  ];

  if (isLoading) return <Spin />;

  if (isError)
    return (
      <Flex gap="small">
        <ExclamationCircleFilled style={{ color: "red", fontSize: "1.4em" }} />
        <p
          style={{
            fontSize: "1em",
            fontWeight: 500,
            color: "rgb(60, 60, 60)",
          }}
        >
          {error.message || "Error occured"}
        </p>
      </Flex>
    );

  if (isSuccess)
    return (
      <Dropdown
        placement="bottom"
        menu={{
          items,
        }}
        trigger={["click"]}
        style={{ bottom: 10 }}
      >
        <div style={{ cursor: "pointer" }}>
          <Space>
            {width > 465 ? <Avatar
              size={{
                xs: 24,
                sm: 32,
                md: 40,
                lg: 40,
                xl: 40
              }}
              icon={<UserOutlined />}
              src={user?.image}
            />: null}
            <p
              style={{
                width: user?.username.length * 10,
                maxWidth: 100,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {user?.username || "Admin"}
            </p>
            <DownOutlined />
          </Space>
        </div>
      </Dropdown>
    );
};
