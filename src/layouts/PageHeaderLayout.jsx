import { Flex } from "antd";

export const PageHeaderLayout = ({ children, margin }) => {
  
  return (
    <Flex style={margin && { marginBottom: "30px" }} gap={"middle"}>
      {children}
    </Flex>
  );
};
