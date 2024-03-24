import { Flex, Modal } from "antd";

export const CustomModal = ({
  title,
  open,
  confirmLoading,
  onClose,
  style,
  children,
}) => {
  return (
    <Modal
      centered
      footer={false}
      open={open}
      confirmLoading={confirmLoading}
      onCancel={onClose}
      destroyOnClose
      style={style}
    >
      <Flex vertical style={{ width: "80%", margin: "0 auto" }} align="center">
        <h1 style={{ marginBottom: 35 }}>{title}</h1>
        {children}
      </Flex>
    </Modal>
  );
};
