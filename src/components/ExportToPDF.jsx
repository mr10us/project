import { FilePdfOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { colors } from "../consts";
import { getUrl } from "../utils/Measurements/getUrl";
import { useTranslation } from "react-i18next";

export const ExportToPDF = ({
  type,
  id,
  query,
  customerID,
  currentPage,
  showText = true,
  fontSize = 16,
}) => {
  const { t } = useTranslation();
  const fileUrl = getUrl.pdf(type, id, query, customerID, currentPage);

  return (
    <a href={fileUrl} style={{ fontSize: fontSize }} target="_blank">
      <Flex
        align="center"
        style={{
          fontSize: fontSize,
          color: colors.blue,
          ...(!showText && { justifyContent: "center" }),
        }}
      >
        <FilePdfOutlined style={{ marginRight: 5, fontSize: 20 }} />
        {showText && t("buttons.export_pdf")}
      </Flex>
    </a>
  );
};
