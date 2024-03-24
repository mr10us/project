import { useEffect, useMemo, useState } from "react";
import { ConfigProvider, Layout, Menu } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  HomeFilled,
  SettingFilled,
  UserOutlined,
  ToolFilled,
  FolderFilled,
  ReconciliationFilled,
  RollbackOutlined,
  HomeOutlined,
  ProjectOutlined,
  ProjectFilled,
  FontColorsOutlined,
} from "@ant-design/icons";
import { UserProvider } from "../hoc/UserProvider";
import { Header } from "../components/Header/Header";
import Logo from "../components/Logo/Logo";
import { BreadCrumb } from "../components/UI/Breadcrumb/Breadcrumb";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { routes, _routes, langs } from "../consts";
import getCustomerPage from "../utils/getCustomerPage";
import { selectCustomer } from "../features/Customer/customer";
import { CheckForCustomerID } from "../components/CheckForCustomerID";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { useGetPermissions } from "../hooks/useGetParmissions";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../hooks/useGetCurrentLang";
import { changeLang } from "../features/CurrentLang/currentLang";

function getItem(label, key, icon, children, disabled = false) {
  return {
    key,
    icon,
    children,
    label,
    disabled,
  };
}

export const CustomersLayout = () => {
  const [collapsed, setCollapsed] = useState();
  const [selected, setSelected] = useState();

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const customer = useSelector(selectCustomer);
  const { width } = useGetCurrentSize();
  const { t } = useTranslation();
  const permissions = useGetPermissions();
  const currentLang = useGetCurrentLang();
  const dispatch = useDispatch();

  const clearPath = pathname.split("/").filter((path) => path !== "");

  const defaultSelectedKey = getCustomerPage(pathname);

  const handleSetSelected = (event) => {
    if (event.keyPath[1] === "languages") dispatch(changeLang(event.key));
    setSelected(event.key);
  };

  const checkForCustomer = () => {
    if (!customer?.id) {
      navigate(routes.CUSTOMERS, { replace: true });
    }
  };
  const availableLangs = useMemo(
    () =>
      Object.values(langs).map((lang) =>
        getItem(lang.toUpperCase(), lang, null)
      ),
    []
  );

  const measurements = useMemo(
    () =>
      permissions.role === "admin"
        ? [
            getItem(
              <Link
                to={
                  routes.CUSTOMERS +
                  `${customer.id}/` +
                  routes.CUSTOMERREPORTSMEASUREMENTSALL
                }
              >
                {t("layouts.customer.all_measurements")}
              </Link>,
              "all"
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS +
                  `${customer.id}/` +
                  routes.CUSTOMERREPORTSMEASUREMENTSDAILY
                }
              >
                {t("layouts.customer.daily_measurements")}
              </Link>,
              "daily"
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS +
                  `${customer.id}/` +
                  routes.CUSTOMERREPORTSMEASUREMENTSMACHINE
                }
              >
                {t("layouts.customer.machine_measurements")}
              </Link>,
              "machine"
            ),
          ]
        : [
            getItem(
              <Link
                to={
                  routes.CUSTOMERS +
                  `${customer.id}/` +
                  routes.CUSTOMERREPORTSMEASUREMENTSDAILY
                }
              >
                {t("layouts.customer.daily_measurements")}
              </Link>,
              "daily"
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS +
                  `${customer.id}/` +
                  routes.CUSTOMERREPORTSMEASUREMENTSMACHINE
                }
              >
                {t("layouts.customer.machine_measurements")}
              </Link>,
              "machine"
            ),
          ],
    [currentLang, permissions]
  );

  const reports = useMemo(
    () => [
      getItem(
        <Link
          to={
            routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERREPORTSALERTS
          }
        >
          {t("layouts.customer.alerts")}
        </Link>,
        "alerts"
      ),
      getItem(t("layouts.customer.measurements"), "measurements", null, [
        ...measurements,
      ]),
    ],
    [currentLang]
  );

  const navItems = useMemo(
    () =>
      width < 768
        ? [
            getItem(
              <Link to={routes.CUSTOMERS} className="navSpacing">
                {t("buttons.leave")}
              </Link>,
              "leave",
              <HomeOutlined />
            ),
            getItem(
              <Link to={-1}>{t("buttons.back")}</Link>,
              "go back",
              <RollbackOutlined />
            ),
            getItem(null, "filler1", null, null, true),
            getItem(
              <Link
                to={routes.CUSTOMERS + `${customer.id}/` + routes.DASHBOARD}
              >
                {t("layouts.customer.dashboard")}
              </Link>,
              "dashboard",
              <ProjectFilled />
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERSETTINGS
                }
              >
                {t("layouts.customer.settings")}
              </Link>,
              "settings",
              <SettingFilled />
            ),
            getItem(
              <Link
                to={routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERUSERS}
              >
                {t("layouts.customer.users")}
              </Link>,
              "users",
              <UserOutlined />
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERMACHINES
                }
              >
                {t("layouts.customer.machines")}
              </Link>,
              "machines",
              <ToolFilled />
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERPACKETS
                }
              >
                {t("layouts.customer.packets")}
              </Link>,
              "packets",
              <FolderFilled />
            ),
            getItem("Reports", "reports", <ReconciliationFilled />, [
              ...reports,
            ]),
            getItem(null, "filler2", null, null, true),
            getItem(
              "Languages",
              "languages",
              <FontColorsOutlined />,
              availableLangs
            ),
          ]
        : [
            getItem(
              <Link
                to={routes.CUSTOMERS + `${customer.id}/` + routes.DASHBOARD}
              >
                {t("layouts.customer.dashboard")}
              </Link>,
              "dashboard",
              <HomeFilled />
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERSETTINGS
                }
              >
                {t("layouts.customer.settings")}
              </Link>,
              "settings",
              <SettingFilled />
            ),
            getItem(
              <Link
                to={routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERUSERS}
              >
                {t("layouts.customer.users")}
              </Link>,
              "users",
              <UserOutlined />
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERMACHINES
                }
              >
                {t("layouts.customer.machines")}
              </Link>,
              "machines",
              <ToolFilled />
            ),
            getItem(
              <Link
                to={
                  routes.CUSTOMERS + `${customer.id}/` + routes.CUSTOMERPACKETS
                }
              >
                {t("layouts.customer.packets")}
              </Link>,
              "packets",
              <FolderFilled />
            ),
            getItem(
              t("layouts.customer.reports"),
              "reports",
              <ReconciliationFilled />,
              [...reports]
            ),
          ],
    [width, currentLang]
  );

  useEffect(() => {
    checkForCustomer();
    return () => {
      // dispatch(dropCustomer());
    };
  }, []);

  if (
    clearPath.length === 2 &&
    clearPath[0] ===
      routes.CUSTOMERS.split("/").filter((path) => path !== "")[0]
  )
    return <Navigate to={routes.DASHBOARD} replace />;

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerPadding: width > 768 ? "0 50px" : "0 15px",
          },
        },
      }}
    >
      <UserProvider>
        <Layout
          style={{
            minHeight: "100vh",
          }}
        >
          {width > 465 ? (
            <Layout.Sider
              collapsible
              collapsed={collapsed}
              breakpoint="md"
              onCollapse={(value) => setCollapsed(value)}
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
                selectedKeys={[selected]}
                onSelect={handleSetSelected}
                items={navItems}
              />
            </Layout.Sider>
          ) : null}
          <Layout>
            <Layout.Header>
              <Header navMenuItems={navItems} />
            </Layout.Header>
            <CheckForCustomerID clearPath={clearPath} />
            <Layout.Content
              style={{
                marginLeft: width > 768 ? 50 : 15,
                marginRight: width > 768 ? 50 : 15,
                marginBottom: 100,
              }}
            >
              <BreadCrumb style={{ margin: "12px" }} />
              <Outlet />
            </Layout.Content>
          </Layout>
        </Layout>
      </UserProvider>
    </ConfigProvider>
  );
};
