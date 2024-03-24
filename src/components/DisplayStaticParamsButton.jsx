import { Flex, Button } from "antd";
import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons";
import { colors } from "../consts";
import { useTranslation } from 'react-i18next';


export const DisplayStaticParamsButton = ({ visible, setVisible }) => {
  const { t } = useTranslation();

  const toggleDisplayStaticParams = () => {
    setVisible((prev) => !prev);
  };

  return (
    <Flex align="center" justify="right">
      <p style={{ color: colors.gray, fontWeight: "bold", fontSize: 16}}>
        {t("customer.packets.packet.measurements.show_static")}
      </p>
      <Button
        icon={
          visible ? (
            <EyeFilled style={{ color: "white" }} />
          ) : (
            <EyeInvisibleFilled style={{ color: "white" }} />
          )
        }
        type="primary"
        size="large"
        style={{ marginLeft: 15 }}
        onClick={toggleDisplayStaticParams}
      />
    </Flex>
  );
};
