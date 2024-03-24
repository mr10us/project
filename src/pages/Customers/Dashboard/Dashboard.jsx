import { Col, Row } from "antd";
import { LastPacket } from "../../../components/LastPacket/LastPacket";
import { PageHeader } from "../../../components/PageHeader/PageHeader";
import { NumberMachines } from "../../../components/NumberMachines/NumberMachines";
import { AlertsForMonth } from "../../../components/AlertsForMonth/AlertsForMonth";
import { useQuery } from "react-query";
import { getDashboardData } from "../../../http/customersApi";
import { useEffect, useMemo } from "react";
import { Loader } from "../../../components/Loader";
import { Error } from "../../../components/Error";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { useTranslation } from 'react-i18next';

export const Dashboard = () => {
  const { t } = useTranslation();
  const customerID = useGetCustomerID();
  const { isLoading, isError, error, isSuccess, data, remove } = useQuery(
    "getDashboardData",
    () => getDashboardData(customerID)
  );

  const lastPacketInfo = useMemo(() => isSuccess && data.last_packet, [data]);
  const numberMachinesInfo = useMemo(
    () => isSuccess && data.machine_widget,
    [data]
  );
  const alertsForMonthInfo = useMemo(
    () => isSuccess && data.alert_widget,
    [data]
  );

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader title={t("customer.dashboard.name")} margin />
      {isLoading && <Loader />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && (
        <Row gutter={[16, 16]} wrap>
          <Col sm={{ span: 24 }} lg={{ span: 18 }} style={{width: "100%"}}>
            <LastPacket data={lastPacketInfo} isLoading={isLoading} />
          </Col>
          <Col sm={{ span: 24 }} lg={{ span: 6 }} style={{width: "100%"}}>
            <NumberMachines data={numberMachinesInfo} isLoading={isLoading} />
          </Col>

          <Col sm={{ span: 24 }} style={{width: "100%"}}>
            <AlertsForMonth data={alertsForMonthInfo} />
          </Col>
        </Row>
      )}
    </>
  );
};
