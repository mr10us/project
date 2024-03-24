import { Modal } from "antd";

export const ConfirmDelete = ({
  title,
  content,
  onOk,
  onCancel,
  okText,
  cancelText,
  cancelButtonProps,
  centered,
}) => {
  return (
    <Modal
      title={title}
      content={content}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      cancelButtonProps={cancelButtonProps}
      centered={centered}
    />
  );
};
