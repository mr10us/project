import { alertLevels } from "../consts";
import { getUserName } from "../utils/Users/getUserName";
import { Evaluation } from "./Evaluation";
import { StandartTable } from "./UI/StandartTable/StandartTable";
import { useTranslation } from 'react-i18next';

export const CustomerUsersTable = ({ users, readOnly, handlePagination }) => {
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
      dataIndex: "number",
      key: "number",
    },
    {
      title: t("users.columns.level"),
      dataIndex: "level",
      key: "level",
    },
  ];

  const items = users.map((user) => {
    const level = alertLevels[user.notify_level] || "null";

    const _user = {
      key: user.id,
      name: getUserName(user),
      email: user.email,
      number: user?.phone_number || "-",
      level: <Evaluation type={level} text />,
    };
    if (!readOnly) _user.link = String(user.id);

    return _user;
  });

  return (
    <StandartTable
      items={items}
      columns={columns}
      searchHint={t("hints.users.search")}
      handlePagination={handlePagination}
    />
  );
};
