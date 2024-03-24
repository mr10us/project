import { Flex } from "antd";

export const Hint = ({ text, children, style }) => {
  return (
    <Flex vertical style={style}>
      {children}
      <p className="hint">{text}</p>
    </Flex>
  );
};
