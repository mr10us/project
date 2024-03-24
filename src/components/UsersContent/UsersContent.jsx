import { ConfigProvider } from "antd";
import { StandartTable } from "../UI/StandartTable/StandartTable";
import { useTranslation } from 'react-i18next';

export const UsersContent = ({ users, handlePagination }) => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("users.columns.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("users.columns.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("users.columns.phone_number"),
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: t("users.columns.level"),
      key: "notify_level",
      dataIndex: "notify_level",
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#f0f0f0",
          },
        },
      }}
    >
      <StandartTable
        columns={columns}
        items={users}
        handlePagination={handlePagination}
      />
    </ConfigProvider>
  );
};
