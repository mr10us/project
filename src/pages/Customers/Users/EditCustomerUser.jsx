import { useEffect, useMemo, useState } from "react";
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
  Space,
} from "antd";
import {
  EditFilled,
  ExclamationCircleTwoTone,
  UserOutlined,
} from "@ant-design/icons";
import { alertLevels, colors, roles, statuses } from "../../../consts";
import { Loader } from "../../../components/Loader";
import { editUser, getUser, removeUser } from "../../../http/usersApi";
import { useNavigate } from "react-router-dom";
import { useGetCurrentPage } from "../../../hooks/useGetCurrentPage";
import { handleErrorFields } from "../../../utils/handleErrorFields";
import { useQuery, useQueryClient } from "react-query";
import { Error } from "../../../components/Error";
import { useGetCurrentSize } from "../../../hooks/useGetCurrentSize";
import { findNestedValue } from "../../../utils/findNestedValue";
import { useTranslation } from "react-i18next";
import { useGetCurrentLang } from "../../../hooks/useGetCurrentLang";

export const EditCustomerUser = () => {
  const userID = useGetCurrentPage();

  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { width } = useGetCurrentSize();
  const { t } = useTranslation();
  const currentLang = useGetCurrentLang();

  Form.useWatch("image", form);

  const navigate = useNavigate();

  const notifyLevelsArray = useMemo(() => {
    const levels = Object.values(alertLevels).map((level) => ({
      label: t(`evaluations.${level}`),
      value: level,
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
  const handleSetRole = (value) => {
    form.setFieldsValue({
      role: value,
    });
  };
  const handleSetStatus = (status) => {
    form.setFieldValue({
      is_active: status,
    });
  };
  const handleSetLevel = (value) => {
    form.setFieldValue({
      notify_level: value,
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

  const {
    isLoading,
    isError,
    error,
    isSuccess,
    data: user,
    remove,
  } = useQuery("getUser", () => getUser(userID));

  const activeStatus = useMemo(
    () => (isSuccess && user.is_active ? "active" : "inactive"),
    [currentLang, user]
  );

  const handleEditUser = async (values) => {
    const image = form.getFieldValue("imageFile");
    const is_active =
      typeof values.is_active === "string"
        ? values.is_active.toLowerCase() === "active"
        : values.is_active;

    const role = values.role;

    const notify_level = values.notify_level;

    try {
      const response = await editUser(userID, {
        ...values,
        is_active: is_active,
        role: role,
        image: image,
        notify_level: notify_level,
      });
      if (response) {
        queryClient.invalidateQueries("getUser");
        message.success(t("messages.success.user.updated"));
      }
    } catch (error) {
      const errorFields = handleErrorFields(response.invalidFields);
      form.setFields(errorFields);
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  const confirmDelete = () => {
    modal.confirm({
      title: t("messages.confirm.deletion.user.title"),
      content: t("messages.confirm.deletion.user.content"),
      type: "warning",
      onOk: handleDeleteUser,
      okText: t("messages.confirm.deletion.user.ok_text"),
      cancelText: t("messages.confirm.deletion.user.cancel_text"),
      cancelButtonProps: { style: { color: "red" } },
      icon: (
        <ExclamationCircleTwoTone
          twoToneColor={"red"}
          style={{ fontSize: 32 }}
        />
      ),
      centered: true,
    });
  };
  const handleDeleteUser = async () => {
    try {
      const response = await removeUser(userID);
      if (response) {
        queryClient.invalidateQueries("customerUsers");
        message.success(t("messages.success.user.deleted"));
        navigate(-1);
      }
    } catch (error) {
      const errorFields = handleErrorFields(response.invalidFields);
      form.setFields(errorFields);
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <>
      <PageHeader title={t("customer.users.user.edit.title")} margin />

      {isLoading && <Loader />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && (
        <>
          <p style={{ color: colors.mainLightGray, marginBottom: 10 }}>
            {t("labels.photo")}
          </p>

          <Form
            form={form}
            size="large"
            layout="vertical"
            onFinish={handleEditUser}
            initialValues={{
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              username: user.username,
              notify_level:
                user.notify_level === null
                  ? notifyLevelsArray[notifyLevelsArray.length - 1].value
                  : user.notify_level,
              image: user.image,
              is_active: t(`statuses.${activeStatus}`),
              role: user.role,
              phone_number: user.phone_number,
            }}
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
                    size={{ xs: 64, sm: 64, md: 64, lg: 64, xl: 80, xxl: 100 }}
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
                style={{ width: width < 525 ? "100%" : "48%" }}
              >
                <Input placeholder={t("placeholders.first_name")} />
              </Form.Item>
              <Form.Item
                name="last_name"
                label={t("labels.last_name")}
                style={{ width: width < 525 ? "100%" : "48%" }}
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
                style={{ width: width < 525 ? "100%" : "48%" }}
              >
                <Input placeholder={t("placeholders.email")} />
              </Form.Item>
              <Form.Item
                name="username"
                label={t("labels.username")}
                rules={[{ required: true, message: t("rules.username") }]}
                style={{ width: width < 525 ? "100%" : "48%" }}
              >
                <Input placeholder={t("placeholders.username")} />
              </Form.Item>
              <Form.Item
                name="notify_level"
                label={t("labels.notification_level")}
                style={{ width: width < 525 ? "100%" : "48%" }}
              >
                <Select
                  onSelect={handleSetLevel}
                  placeholder={t("placeholders.notification_level")}
                >
                  {notifyLevelsArray.map((level) => (
                    <Select.Option key={level.value} value={level.value}>
                      {level.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="is_active"
                label={t("labels.status")}
                style={{ width: width < 525 ? "100%" : "48%" }}
              >
                <Select
                  onSelect={handleSetStatus}
                  placeholder={t("placeholders.status")}
                >
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
                style={{ width: width < 525 ? "100%" : "48%" }}
              >
                <Select
                  onSelect={handleSetRole}
                  placeholder={t("placeholders.role")}
                >
                  {rolesArray.map((role) => (
                    <Select.Option key={role.value} value={role.value}>
                      {role.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="phone_number"
                label={t("labels.phone_number")}
                style={{ width: width < 525 ? "100%" : "48%" }}
              >
                <Input placeholder={t("placeholders.phone_number")} />
              </Form.Item>
            </Flex>
            <Form.Item style={{ marginTop: 40 }}>
              <Space size="large">
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ padding: width < 525 ? "0 18px" : "0 42px" }}
                >
                  {t("buttons.save")}
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={confirmDelete}
                  style={{ padding: width < 525 ? "0 18px" : "0 42px" }}
                >
                  {t("buttons.remove.default")}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </>
  );
};
