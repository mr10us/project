import { App, Button, Form, Input } from "antd";
import { updatePasswordMe } from "../../http/meApi";
import { useTranslation } from "react-i18next";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";
import { CustomModal } from "./CustomModal";
import { findNestedValue } from "../../utils/findNestedValue";
import { handleErrorFields } from "../../utils/handleErrorFields";

export const UpdatePasswordMeModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { t } = useTranslation();

  const handleChangePassword = async ({ old_password, new_password }) => {
    try {
      const response = await updatePasswordMe(old_password, new_password);
      if (response) {
        message.success("Password updated successfuly");
        onClose();
      }
    } catch (error) {
      console.log(error)
      if (error?.response?.data) {
        const errorFields = handleErrorFields(error.response.data);
        form.setFields(errorFields);
      }
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={t("modals.profile_settings.title")}
    >
      <Form
        layout="vertical"
        onFinish={handleChangePassword}
        style={{ width: "80%" }}
        form={form}
      >
        <Form.Item
          name="old_password"
          label={t("labels.old_pwd")}
          rules={[{ required: true, message: t("rules.old_pwd") }]}
        >
          <Input.Password placeholder={t("placeholders.old_pwd")} />
        </Form.Item>

        <Form.Item
          name="new_password"
          label={t("labels.new_pwd")}
          rules={[{ required: true, message: t("rules.new_pwd") }]}
        >
          <Input.Password placeholder={t("placeholders.new_pwd")} />
        </Form.Item>

        <Form.Item
          name="confirm_new_password"
          label={t("labels.confirm_new_pwd")}
          dependencies={["new_password"]}
          rules={[
            { required: true, message: t("rules.confirm_new_pwd") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("new_password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(t("rules.valid.confirm_new_pwd"));
              },
            }),
          ]}
        >
          <Input.Password placeholder={t("placeholders.confirm_new_pwd")} />
        </Form.Item>
        <Button block type="primary" htmlType="submit">
          {t("buttons.save_password")}
        </Button>
      </Form>
    </CustomModal>
  );
};
