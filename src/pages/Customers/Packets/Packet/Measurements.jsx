import { Badge, Flex } from "antd";
import { PacketStatistics } from "../../../../components/PacketStatistics";
import { useTranslation } from "react-i18next";
import { MeasurementTable } from "../../../../components/MeasurementTable";
import { useGetCurrentSize } from "../../../../hooks/useGetCurrentSize";
import { useMemo } from "react";
import { useGetPermissions } from "../../../../hooks/useGetParmissions";

export const Measurements = ({
  statistics,
  measurements,
  setTableItemsData,
}) => {
  const allParams = measurements.map((item) => item.parameters);

  const { width } = useGetCurrentSize();
  const { role } = useGetPermissions();
  const { t } = useTranslation();

  const canOverride = useMemo(() => (role === "guest" ? false : true), [role]);

  const machineMeasurements = measurements.filter(
    (measurement) => measurement.machine !== null
  );

  const abstractParamsMeasurements = measurements
    .filter((measurement) => measurement.machine === null)
    .map((measurement) => ({ ...measurement, machine: { id: "abstract" } }));

  const fixedCols = useMemo(
    () =>
      width < 426
        ? [
            {
              name: "ordinal_number",
              title: t(
                "customer.packets.packet.measurements.columns.ordinal_number"
              ),
            },
          ]
        : [
            {
              name: "ordinal_number",
              title: t(
                "customer.packets.packet.measurements.columns.ordinal_number"
              ),
            },
            {
              name: "internal_number",
              title: t(
                "customer.packets.packet.measurements.columns.internal_number"
              ),
            },
            {
              name: "model",
              title: t("customer.packets.packet.measurements.columns.model"),
            },
          ],
    [width]
  );

  const staticTableRows = machineMeasurements
    .filter((measurement) => measurement.machine.id !== "abstract")
    .map((item) => ({
      internal_number: item.machine.internal_number,
      ordinal_number: item.machine.ordinal_number,
      model: `${item.machine_model.brand.name} ${item.machine_model.name}`,
      id: item.machine.internal_number,
    }));

  return (
    <Flex vertical gap={40} style={{ marginBottom: 40 }}>
      
      <MeasurementTable
        statistics={statistics}
        readOnly={!canOverride}
        measurements={machineMeasurements}
        setMeasurements={setTableItemsData}
        tableFixedColumns={fixedCols}
        tableFixedRows={staticTableRows}
        pageSize={20}
      />
      {abstractParamsMeasurements.length !== 0 ? (
        <MeasurementTable
          readOnly={!canOverride}
          measurements={abstractParamsMeasurements}
          setMeasurements={setTableItemsData}
          tableFixedColumns={[]}
          tableFixedRows={[]}
        />
      ) : null}
      <PacketStatistics statistics={statistics} params={allParams} />
    </Flex>
  );
};
