import {
  Button,
  Drawer,
  Dropdown,
  Flex,
  Segmented,
  Space,
  Tooltip,
} from "antd";
import { Link, useLocation } from "react-router-dom";
import { routes, colors, langs, roles } from "../../consts";
import { useDispatch, useSelector } from "react-redux";
import { changeLang } from "../../features/CurrentLang/currentLang";
import { UserMenu } from "../UserMenu";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";
import { selectCustomer } from "../../features/Customer/customer";
import { useGetPermissions } from "../../hooks/useGetParmissions";
import { useGetCurrentLang } from "../../hooks/useGetCurrentLang";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { DownOutlined, MenuOutlined } from "@ant-design/icons";
import { RenderMenuItem } from "../RenderMenuItem";

export const Header = ({ navMenuItems }) => {
  const [drawer, setDrawer] = useState(false);

  const openDrawer = () => {
    setDrawer(true);
  };
  const closeDrawer = () => {
    setDrawer(false);
  };
  const location = useLocation();
  const pages = location.pathname.split("/").filter((path) => path !== "");
  const pagePartition = pages[0];
  const currentLoc = `/${pagePartition}/`;
  const dispatch = useDispatch();
  const { width } = useGetCurrentSize();
  const currentLang = useGetCurrentLang();
  const { t } = useTranslation();
  const isMobile = width < 465;

  const customer = useSelector(selectCustomer);
  const permissions = useGetPermissions();

  const isInCustomerPartition = pages.length >= 2 && pagePartition === "customers";

  const isDeepIn = isInCustomerPartition && currentLoc === routes.CUSTOMERS;

  const handleLangChange = (lang) => {
    dispatch(changeLang(lang));
  };

  const langButtons = Object.values(langs).map((lang) => ({
    label: lang.toUpperCase(),
    value: lang,
  }));

  const navButtons = useMemo(
    () => [
      {
        key: "settings",
        label: "abs",
        to: routes.SETTINGS,
        className:
          currentLoc === routes.SETTINGS
            ? "mainNavBtn nav-selected"
            : "mainNavBtn",

        children: t("settings.name"),
      },

      {
        key: "customers",
        to: routes.CUSTOMERS,
        className:
          currentLoc === routes.CUSTOMERS
            ? "mainNavBtn nav-selected"
            : "mainNavBtn",
        children: t("customers.name"),
      },
      {
        key: "users",
        to: routes.USERS,
        className:
          currentLoc === routes.USERS
            ? "mainNavBtn nav-selected"
            : "mainNavBtn",
        children: t("users.name"),
      },
    ],
    []
  );

  const items = useMemo(
    () =>
      navButtons.map((btn) => ({
        key: btn.key,
        label: (
          <Link to={btn.to}>
            {btn.key.charAt(0).toUpperCase() + btn.key.slice(1)}
          </Link>
        ),
      })),
    [currentLoc]
  );

  return (
    <Flex
      justify="space-between"
      align="center"
      style={{ borderBottom: "2px solid #b5b8bf66" }}
    >
      {isMobile && isInCustomerPartition && (
        <>
          <Drawer
            keyboard
            size="large"
            placement="left"
            destroyOnClose
            open={drawer}
            onClose={closeDrawer}
          >
            <Flex vertical>
              {navMenuItems.map((item) => (
                <RenderMenuItem
                  key={item.key}
                  item={item}
                  handleCloseDrawer={closeDrawer}
                />
              ))}
            </Flex>
          </Drawer>

          <Button icon={<MenuOutlined />} type="primary" onClick={openDrawer} />
        </>
      )}
      <div>
        {isDeepIn ? (
          <Flex gap="large">
            {width > 768 && permissions.isStaff && (
              <div>
                <Link
                  to={routes.CUSTOMERS}
                  className="mainNavBtn btn"
                  style={{ display: "inline", padding: "10px 20px" }}
                >
                  {t("buttons.leave")}
                </Link>
              </div>
            )}
            {width * 0.8 < customer.name.length * 10 + 20 + 100 + 80 ? (
              <Tooltip title={customer.name}>
                <h3
                  style={{
                    width: width / 5,
                    color: colors.mainLightGray,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {customer.name}
                </h3>
              </Tooltip>
            ) : (
              <Tooltip>
                <h3
                  style={{
                    width: customer.name.length * 10,
                    color: colors.mainLightGray,
                    // textOverflow: "ellipsis",
                    // whiteSpace: "nowrap",
                    // overflow: "hidden",
                  }}
                >
                  {customer.name}
                </h3>
              </Tooltip>
            )}
          </Flex>
        ) : width > 768 ? (
          <Space>
            {permissions.role === roles.admin.toLowerCase() &&
            permissions.isStaff
              ? navButtons.map((button) => (
                  <Link
                    key={button.key}
                    to={button.to}
                    className={button.className}
                  >
                    {button.children}
                  </Link>
                ))
              : null}
          </Space>
        ) : currentLoc !== "/settings/" ? (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <p
              className="mainNavBtn nav-selected"
              style={{ display: "inline", marginRight: 15, fontSize: 14 }}
            >
              {pagePartition.charAt(0).toUpperCase() +
                pagePartition.slice(1) +
                " "}
              <DownOutlined />
            </p>
          </Dropdown>
        ) : null}
      </div>
      <Space size="large">
        {width > 768 ? (
          <Segmented
            className="small-gap"
            size="large"
            value={currentLang}
            options={langButtons}
            onChange={handleLangChange}
          />
        ) : null}
        {/* TEMPORARY – ENGLISH only */}

        <UserMenu />
      </Space>
    </Flex>
  );
};
