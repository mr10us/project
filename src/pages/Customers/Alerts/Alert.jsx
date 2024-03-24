import { Flex, Image } from "antd";
import { Evaluation } from "../../../components/Evaluation";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { Link } from "react-router-dom";
import { useGetCurrentPage } from "../../../hooks/useGetCurrentPage";
import { useQuery } from "react-query";
import { getAlert } from "../../../http/alertsApi";
import { useEffect, useMemo } from "react";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";
import { getCustomerMachineName } from "../../../utils/MachineModels/nameHelper";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { colors, routes } from "../../../consts";
import { useTranslation } from "react-i18next";
import { getLocaleDate } from "../../../utils/dateHelper";
import { useGetLocale } from "../../../hooks/useGetLocale";

export const Alert = () => {
  const alertID = useGetCurrentPage();
  const customerID = useGetCustomerID();
  const { t } = useTranslation();
  const locale = useGetLocale();

  const {
    isLoading,
    isError,
    error,
    isSuccess,
    data: alert,
    remove,
  } = useQuery("getAlert", () => getAlert(alertID));

  const title = {
    color: colors.darkGray,
    margin: "5px 0",
  };
  const section = {
    margin: "20px 0",
  };

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader title={t("customer.alerts.alert.title")} />
      {isLoading && <Loader />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && (
        <>
          <p style={{ color: colors.gray }}>
            {t("customer.alerts.alert.date.0")}
            <Link
              to={
                routes.CUSTOMERS +
                customerID +
                "/" +
                routes.CUSTOMERPACKETS +
                alert.packet_id
              }
            >
              {t("customer.alerts.alert.date.1")}
            </Link>
            {t("customer.alerts.alert.date.2", {
              date: getLocaleDate(alert.created_at, locale),
            })}
          </p>
          {alert.machine ? (
            <p>
              {t("customer.alerts.alert.related", {
                machine: getCustomerMachineName(alert.machine),
              })}
            </p>
          ) : null}

          <div style={section}>
            <h3 style={title}>{t("customer.alerts.alert.level")}</h3>
            <Evaluation type={alert.danger_level} text />
          </div>

          <div style={section}>
            <h3 style={title}>{t("customer.alerts.alert.title")}</h3>
            <p>{alert.title}</p>
          </div>

          <div style={section}>
            <h3 style={title}>{t("customer.alerts.alert.description")}</h3>
            <p>{alert.content}</p>
          </div>

          {alert.media_files.length > 0 ? (
            <div style={section}>
              <h3 style={title}>{t("customer.alerts.alert.media")}</h3>
              <Flex wrap="wrap" gap={"middle"}>
                {alert.media_files.map((media) => (
                  <Image
                    style={{ maxHeight: 400, maxWidth: 300 }}
                    src={media.file}
                    key={media.id}
                  />
                ))}
              </Flex>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};
