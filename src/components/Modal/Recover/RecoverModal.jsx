import { App, Button, Flex, Form, Input, Modal } from "antd";
import styles from "./RecoverModal.module.css";
import { sendResetLetter } from "../../../http/passwordResetApi";
import { findNestedValue } from "../../../utils/findNestedValue";
import { handleErrorFields } from "../../../utils/handleErrorFields";

export default function RecoverModal({ isOpen, toggleModal }) {
  const handleClose = () => {
    toggleModal(false);
  };

  const [form] = Form.useForm();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    const username = values.user_identity;
    try {
      const response = await sendResetLetter(username);

      if (response) {
        message.success("A reset letter was send to your account");
        handleClose();
      }
    } catch (error) {
      if (error?.response?.data && typeof error?.response?.data !== "string") {
        const errorFields = handleErrorFields(error.response.data);
        form.setFields(errorFields);
      } else {
        const errorMsg = findNestedValue(error?.response?.data || null);
        message.error(errorMsg || error.message);
      }
    }
  };
  const onFinishFailed = () => {
    console.log(values);
  };

  return (
    <Modal
      centered
      open={isOpen}
      onOk={handleClose}
      onCancel={handleClose}
      footer={null}
    >
      <Flex
        align="center"
        justify="center"
        vertical
        gap={25}
        styles={{ padding: "30px 50px" }}
      >
        <h2 className={styles.title}>Forgot Password</h2>
        <p className={styles.descr}>
          In order for us to send you an email to reset your password, please
          enter your username or your email address that you specified during
          registration
        </p>
        <Form
          layout="vertical"
          style={{ width: "60%" }}
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="user_identity"
            rules={[
              {
                required: true,
                message: "Please, enter your username or email",
              },
            ]}
          >
            <Input placeholder="Enter your username or email" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </Modal>
  );
}
