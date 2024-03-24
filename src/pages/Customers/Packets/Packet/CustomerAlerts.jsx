import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { AlertForm } from "../../../../components/AlertForm";
import { CustomEmpty } from "../../../../components/UI/CustomEmpty";
import { useTranslation } from "react-i18next";

export const CustomerAlerts = ({ customerAlert, setCustomerAlert, readOnly }) => {
  const { t } = useTranslation();

  const handleAddAlert = () => {
    setCustomerAlert([
      {
        machine: { name: null, id: -1 },
        title: "",
        description: "",
        level: "suspicious",
        media: [],
      },
    ]);
  };

  return (
    <>
      {customerAlert?.length === 0 ? (
        <CustomEmpty>
          {!readOnly ? (
            <Button onClick={handleAddAlert}>
              <PlusOutlined /> {t("buttons.add.customer_alert")}
            </Button>
          ) : null}
        </CustomEmpty>
      ) : (
        <AlertForm alert={customerAlert[0]} onChange={setCustomerAlert} readOnly={readOnly} />
      )}
    </>
  );
};
