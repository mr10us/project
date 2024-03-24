import { Empty } from "antd";
import { colors } from "../../consts";
import { useTranslation } from 'react-i18next';

export const CustomEmpty = (props) => {
  const { t } = useTranslation();

  return (
    <Empty
      description={props?.description || t("no_data.title")}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      style={{
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        padding: "32px 0",
      }}
      {...props}
    >
      {props.children}
    </Empty>
  );
};
