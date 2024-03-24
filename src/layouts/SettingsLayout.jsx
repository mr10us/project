import React, { useEffect, useMemo, useState } from "react";
import {
  ToolFilled,
  ExperimentFilled,
  RestFilled,
  CalculatorFilled,
  TagFilled,
  SettingFilled,
  TeamOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Divider, Layout, Menu } from "antd";
import { Header } from "../components/Header/Header";
import Logo from "../components/Logo/Logo";
import { BreadCrumb } from "../components/UI/Breadcrumb/Breadcrumb";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { routes } from "../consts";
import getSettingPage from "../utils/getSettingPage";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { useGetPermissions } from "../hooks/useGetParmissions";
import { UserProvider } from "../hoc/UserProvider";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../hooks/useGetCurrentLang";

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

export const SettingsLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const { t } = useTranslation();
  const { width } = useGetCurrentSize();
  const { pathname } = useLocation();
  const permissions = useGetPermissions();
  const currentLang = useGetCurrentLang();

  const defaultSelectedKey = getSettingPage(pathname);

  const items = useMemo(
    () => [
      getItem(
        <Link to={routes.SETTINGS + routes.MACHINES}>{t("layouts.settings.machines")}</Link>,
        "machines",
        <ToolFilled />
      ),
      getItem(
        <Link to={routes.SETTINGS + routes.CF}>{t("layouts.settings.cf")}</Link>,
        "cutting_fluids",
        <ExperimentFilled />
      ),
      getItem(
        <Link to={routes.SETTINGS + routes.MIXERS}>{t("layouts.settings.mixers")}</Link>,
        "mixers",
        <RestFilled />
      ),
      getItem(
        <Link to={routes.SETTINGS + routes.PARAMETERS}>{t("layouts.settings.parameters")}</Link>,
        "parameters",
        <CalculatorFilled />
      ),
      getItem(
        <Link to={routes.SETTINGS + routes.BRANDS}>{t("layouts.settings.brands")}</Link>,
        "brands",
        <TagFilled />
      ),
    ],
    [currentLang]
  );

  const mainNav = useMemo(
    () => [
      getItem(
        <Link to={routes.SETTINGS}>{t("layouts.settings.settings")}</Link>,
        "settings",
        <SettingFilled />
      ),
      getItem(
        <Link to={routes.CUSTOMERS}>{t("layouts.settings.customers")}</Link>,
        "customers",
        <SolutionOutlined />
      ),
      getItem(<Link to={routes.USERS}>{t("layouts.settings.users")}</Link>, "users", <TeamOutlined />),
      getItem(null, null),
    ],
    [currentLang]
  );

  useEffect(() => {
    if (width < 768) setCollapsed(true);
    else setCollapsed(false);
  }, [width]);

  if (pathname === routes.SETTINGS)
    return <Navigate to={routes.MACHINES} replace />;

  if (
    permissions.isStaff === false &&
    permissions.available_customers.length === 1
  )
    return <Navigate to={permissions.available_customers[0]} replace />;

  return (
    <UserProvider>
      <Layout style={{ minHeight: "100vh" }}>
        {width && (
          <Layout.Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            breakpoint="md"
            onBreakpoint={(broken) => {
              setCollapsed(broken);
            }}
          >
            <Link to={routes.CUSTOMERS}>
              <Logo
                style={{
                  textAlign: "center",
                  margin: "20px auto",
                  marginBottom: 50,
                  width: "50%",
                }}
              />
            </Link>
            <Menu
              theme="dark"
              defaultSelectedKeys={[defaultSelectedKey]}
              mode="inline"
              items={width < 768 ? [...mainNav, ...items] : items}
            />
          </Layout.Sider>
        )}
        <Layout>
          <Layout.Header>
            <Header />
          </Layout.Header>
          <Layout.Content
            style={{
              margin: "0 50px",
              marginBottom: 100,
            }}
          >
            <BreadCrumb style={{ margin: "12px" }} />
            <Outlet />
          </Layout.Content>
        </Layout>
      </Layout>
    </UserProvider>
  );
};
