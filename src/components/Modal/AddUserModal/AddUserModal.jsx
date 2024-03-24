import { App, Button, Form, Input, Modal } from "antd";
import { Search } from "../../UI/Search/Search";
import { roles } from "../../../consts";
import { createUser } from "../../../http/usersApi";
import { handleErrorFields } from "../../../utils/handleErrorFields";
import { useMutation, useQueryClient } from "react-query";
import { AxiosError } from "axios";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { useTranslation } from "react-i18next";

export const AddUserModal = ({ open, setOpen }) => {
  const modalContainer = {
    padding: "30px 50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 25,
  };

  const { message } = App.useApp();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const customerID = useGetCustomerID();
  const { t } = useTranslation();

  const userRoles = Object.entries(roles).map(([id, role]) => ({
    label: t(`roles.${id}`),
    value: id,
  }));

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleRoleChange = (value) => {
    form.setFieldsValue({
      role: value,
    });
  };

  const handleCreateUser = async () => {
    const { username, role, email } = form.getFieldsValue();

    await createUser(username, email, role, {
      is_staff: true,
      is_active: true,
    });
    queryClient.invalidateQueries("getUsers");
    message.success("User created successfuly!");
    handleCloseModal();
    form.resetFields();
  };

  const { mutateAsync: addUser } = useMutation({
    mutationFn: handleCreateUser,
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (!error?.response) throw Error(error.message);

        const errorFields = handleErrorFields(error.response.data);
        form.setFields(errorFields);
      }
    },
  });

  return (
    <Modal
      open={open}
      centered
      onCancel={handleCloseModal}
      styles={{ body: modalContainer }}
      footer={null}
      destroyOnClose
      onFinish={addUser}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ width: "80%" }}
        onFinish={handleCreateUser}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>{t("users.add_user")}</h1>
        <Form.Item
          name="username"
          label={t("labels.username")}
          rules={[
            { required: true, message: t("rules.new.username") },
          ]}
        >
          <Input placeholder={t("placeholders.username")} />
        </Form.Item>
        <Form.Item
          name="email"
          label={t("labels.email")}
          rules={[
            { required: true, message: t("rules.new.email") },
            {
              type: "email",
              message: t("rules.valid.email"),
            },
          ]}
        >
          <Input placeholder={t("placeholders.email")} />
        </Form.Item>
        <Form.Item
          name="role"
          label={t("labels.role")}
          rules={[
            { required: true, message: t("rules.new.role") },
          ]}
        >
          <Search
            options={userRoles}
            placeholder={t("placeholders.role")}
            handleSelect={handleRoleChange}
          />
        </Form.Item>
        <Button block type="primary" htmlType="submit">
          {t("buttons.add.default")}
        </Button>
      </Form>
    </Modal>
  );
};
