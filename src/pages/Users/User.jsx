import {
  Flex,
  Form,
  Skeleton,
  Avatar,
  Badge,
  Input,
  Button,
  Upload,
  Select,
  App,
} from "antd";
import { MainLayout } from "../../layouts/MainLayout";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import { useEffect, useMemo } from "react";
import { useGetCurrentPage } from "../../hooks/useGetCurrentPage";
import { editUser, getUser } from "../../http/usersApi";
import { getUserName } from "../../utils/Users/getUserName";
import { EditFilled } from "@ant-design/icons";
import { colors, roles, statuses } from "../../consts";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Error } from "../../components/Error";
import { findNestedValue } from "../../utils/findNestedValue";

export const User = () => {
  const userID = useGetCurrentPage();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  Form.useWatch("image", form);

  const userRoles = Object.entries(roles).map(([id, role]) => ({
    label: role,
    value: id,
  }));
  const userStatuses = Object.entries(statuses).map(([_, status]) => ({
    label: status,
    value: status.toLowerCase(),
  }));

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
  const handleSetStatus = (value) => {
    form.setFieldValue({
      status: value === "active",
    });
  };

  const setUserImage = ({ file, onSuccess }) => {
    onSuccess();
    handleSetAvatar({ url: URL.createObjectURL(file), file: file });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return isImage;
  };

  const handleEditUser = async () => {
    const image = form.getFieldValue("imageFile");
    const values = form.getFieldsValue();

    const is_active =
      typeof values.is_active === "string"
        ? values.is_active.toLowerCase() === "active"
        : values.is_active;

    const role = values.role.toLowerCase();
    try {
      const response = await editUser(userID, {
        ...values,
        is_active: is_active,
        role: role,
        image: image,
      });
      if (response) {
        message.success("User info updated successful!");
        queryClient.invalidateQueries(["getUser", "getMe"]);
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };
  

  const { isLoading, isError, error, isSuccess, data, remove } = useQuery(
    "getUser",
    () => getUser(userID)
  );
  const user = useMemo(
    () => (isSuccess ? new Object({ ...data, name: getUserName(data) }) : null),
    [data]
  );

  useEffect(() => {
    return () => remove();
  }, []);

  return (
    <MainLayout>
      {isLoading && <Skeleton loading={isLoading} />}
      {isError && <Error errorMsg={error.message} />}
      {isSuccess && (
        <Flex vertical justify="space-between" gap={15}>
          <PageHeader title={user.name} />
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditUser}
            initialValues={{
              image: user.image,
              username: user.username,
              email: user.email,
              phone_number: user.phone_number,
              first_name: user.first_name,
              last_name: user.last_name,
              is_active: statuses[Number(user.is_active)],
              role: roles[user.role],
            }}
          >
            <Form.Item name="image" label={"Photo"}>
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
                  defaultFileList={[
                    {
                      uid: user.id,
                      name: user.name,
                      status: "done",
                      url: user.image,
                    },
                  ]}
                  showUploadList={false}
                >
                  <Avatar
                    style={{ cursor: "pointer" }}
                    size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                    src={form.getFieldValue("image")}
                    alt={`${user.name} avatar`}
                  />
                </Upload>
              </Badge>
            </Form.Item>
            <Flex wrap="wrap" gap={"large"}>
              <Form.Item
                name="first_name"
                label="First Name"
                style={{ minWidth: 300, width: "30%" }}
              >
                <Input placeholder={"Enter user`s first name"} />
              </Form.Item>
              <Form.Item
                name="last_name"
                label="Last Name"
                style={{ minWidth: 300, width: "30%" }}
              >
                <Input placeholder={"Enter user`s last name"} />
              </Form.Item>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                style={{ minWidth: 300, width: "30%" }}
              >
                <Input placeholder={"Enter user`s phone number"} />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please, enter user`s email" },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
                style={{ minWidth: 300, width: "30%" }}
              >
                <Input placeholder={"Enter user`s email"} />
              </Form.Item>
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  {
                    required: true,
                    message: "Please, enter new user`s username",
                  },
                ]}
                style={{ minWidth: 300, width: "30%" }}
              >
                <Input placeholder={"Enter user`s username"} />
              </Form.Item>
              <Form.Item
                name="role"
                label="Role"
                rules={[
                  { required: true, message: "Please, choose new user`s role" },
                ]}
                style={{ minWidth: 300, width: "30%" }}
              >
                <Select
                  onSelect={handleSetRole}
                  placeholder={"Choose user`s role"}
                >
                  {userRoles.map((role) => (
                    <Select.Option key={role.value} value={role.value}>
                      {role.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="is_active"
                label="Active Status"
                style={{ minWidth: 300, width: "30%" }}
              >
                <Select
                  onSelect={handleSetStatus}
                  placeholder={"Choose user`s active status"}
                >
                  {userStatuses.map((status) => (
                    <Select.Option key={status.value} value={status.value}>
                      {status.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Flex>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form>
        </Flex>
      )}
    </MainLayout>
  );
};
