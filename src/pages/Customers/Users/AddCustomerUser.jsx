import { PageHeader } from "../../../components/PageHeader/PageHeader";
import {
  Avatar,
  Badge,
  Flex,
  Form,
  Input,
  Button,
  Select,
  App,
  Upload,
} from "antd";
import { EditFilled, UserOutlined } from "@ant-design/icons";
import { alertLevels, colors, roles, statuses } from "../../../consts";
import { createUser } from "../../../http/usersApi";
import { useNavigate } from "react-router-dom";
import { useGetCustomerID } from "../../../hooks/useGetCustomerID";
import { handleErrorFields } from "../../../utils/handleErrorFields";
import { useQueryClient } from "react-query";
import { findNestedValue } from "../../../utils/findNestedValue";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";

export const AddCustomerUser = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const customerID = useGetCustomerID();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const currentLang = useGetCurrentLang();

  Form.useWatch("image", form);

  const notifyLevelsArray = useMemo(() => {
    const levels = Object.entries(alertLevels).map(([key, value]) => ({
      label: t(`evaluations.${value}`),
      value: key,
    }));
    levels.push({
      label: t("evaluations.null"),
      value: "null",
    });
    return levels;
  }, [currentLang]);

  const activeStatusesArray = useMemo(
    () =>
      Object.entries(statuses).map(([id, status]) => ({
        label: t(`statuses.${status.toLowerCase()}`),
        value: Boolean(Number(id)),
      })),
    [currentLang]
  );

  const rolesArray = useMemo(
    () =>
      Object.entries(roles).map(([id, role]) => ({
        label: t(`roles.${role.toLowerCase()}`),
        value: id,
      })),
    [currentLang]
  );

  const handleSetAvatar = (icon) => {
    form.setFieldsValue({
      image: icon.url,
      imageFile: icon.file,
    });
  };

  const setUserImage = ({ file, onSuccess }) => {
    onSuccess();
    handleSetAvatar({ url: URL.createObjectURL(file), file: file });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error(t("messages.error.image_only"));
    }
    return isImage;
  };

  const handleAddUser = async (values) => {
    const image = form.getFieldValue("imageFile");
    const is_active =
      typeof values.is_active === "string" ? true : values.is_active;

    const dataToCreateUser = {
      ...values,
      username: values.username,
      email: values.email,
      role: values.role,
      image: image,
      is_active: is_active,
    };
    dataToCreateUser.available_customers = [customerID];

    try {
      const response = await createUser(
        dataToCreateUser.username,
        dataToCreateUser.email,
        dataToCreateUser.role,
        dataToCreateUser
      );
      if (response) {
        message.success(t("messages.success.user.created"));
        queryClient.invalidateQueries("customerUsers");
        navigate(-1, { replace: true });
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

  return (
    <>
      <PageHeader title={t("customer.users.user.add.title")} margin />

      <p style={{ color: colors.mainLightGray, marginBottom: 10 }}>{t("labels.photo")}</p>

      <Form
        form={form}
        size="large"
        layout="vertical"
        onFinish={handleAddUser}
        initialValues={{ is_active: "Active" }}
      >
        <Form.Item name="image">
          <Badge
            count={<EditFilled style={{ color: "white" }} />}
            style={{
              backgroundColor: colors.blue,
              padding: 8,
              borderRadius: "50%",
              top: 10,
              right: 10,
            }}
          >
            <Upload
              accept="image/*"
              customRequest={setUserImage}
              beforeUpload={beforeUpload}
              showUploadList={false}
            >
              <Avatar
                style={{ cursor: "pointer" }}
                size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                src={form.getFieldValue("image")}
                icon={<UserOutlined />}
                alt={"user avatar"}
              />
            </Upload>
          </Badge>
        </Form.Item>
        <Flex wrap="wrap" gap="middle" justify="space-between">
          <Form.Item
            name="first_name"
            label={t("labels.first_name")}
            style={{ width: "48%" }}
          >
            <Input placeholder={t("placeholders.first_name")} />
          </Form.Item>
          <Form.Item
            name="last_name"
            label={t("labels.last_name")}
            style={{ width: "48%" }}
          >
            <Input placeholder={t("placeholders.last_name")} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t("labels.email")}
            rules={[
              { required: true, message: t("rules.email") },
              {
                type: "email",
                message: t("rules.valid.email"),
              },
            ]}
            style={{ width: "48%" }}
          >
            <Input placeholder={t("placeholders.email")} />
          </Form.Item>
          <Form.Item
            name="username"
            label={t("labels.username")}
            rules={[{ required: true, message: t("rules.username") }]}
            style={{ width: "48%" }}
          >
            <Input placeholder={t("placeholders.username")} />
          </Form.Item>
          <Form.Item
            name="notify_level"
            label={t("labels.notification_level")}
            style={{ width: "48%" }}
          >
            <Select
              options={notifyLevelsArray}
              placeholder={t("placeholders.notification_level")}
            />
          </Form.Item>
          <Form.Item
            name="is_active"
            label={t("labels.status")}
            style={{ width: "48%" }}
          >
            <Select placeholder={t("placeholders.status")}>
              {activeStatusesArray.map((status) => (
                <Select.Option key={status.value} value={status.value}>
                  {status.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="role"
            label={t("labels.role")}
            rules={[{ required: true, message: t("rules.role") }]}
            style={{ width: "48%" }}
          >
            <Select options={rolesArray} placeholder={t("placeholders.role")} />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label={t("labels.phone_number")}
            style={{ width: "48%" }}
          >
            <Input placeholder={t("placeholders.phone_number")} />
          </Form.Item>
        </Flex>
        <Form.Item style={{ marginTop: 40 }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ padding: "0 42px" }}
          >
            {t("buttons.save")}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
