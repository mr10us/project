import { ExclamationCircleFilled } from "@ant-design/icons";
import { Flex } from "antd";import { colors } from "../consts";

export const Error = ({ errorMsg }) => {
  return (
    <Flex
      align="center"
      justify="center"
      gap="middle"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        padding: 40,
      }}
    >
      <ExclamationCircleFilled style={{ color: "red", fontSize: "3em" }} />
      <p style={{ fontSize: "1.4em", fontWeight: 500, color: "rgb(60, 60, 60)"}}>
        {errorMsg || "Error occured"}
      </p>
    </Flex>
  );
};
