import { Popover } from "antd";

export const EllipsisTextPopover = ({ text }) => {
  return (
    <Popover content={text}>
      <span
        style={{
          display: "inline-block",
          maxWidth: "160px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </Popover>
  );
};
