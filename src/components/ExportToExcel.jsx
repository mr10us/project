import { FilePdfOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { colors } from "../consts";
import { getUrl } from "../utils/Measurements/getUrl";
import { useTranslation } from "react-i18next";

export const ExportToExcel = ({ type, id, query, customerID, currentPage }) => {
  const { t } = useTranslation();
  const fileUrl = getUrl.excel(type, id, query, customerID, currentPage);

  return (
    <a href={fileUrl} style={{ fontSize: 16 }} download>
      <Flex align="center" style={{ fontSize: 16, color: colors.blue }}>
        <FilePdfOutlined style={{ marginRight: 5, fontSize: 20 }} />
        {t("buttons.export_excel")}
      </Flex>
    </a>
  );
};
