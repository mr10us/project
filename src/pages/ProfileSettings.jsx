import { EditFilled, LockOutlined, UserOutlined } from "@ant-design/icons";
import { PageHeader } from "../components/PageHeader/PageHeader";
import { MainLayout } from "../layouts/MainLayout";
import { App, Avatar, Badge, Button, Flex, Form, Input, Upload } from "antd";
import { colors } from "../consts";
import { Loader } from "../components/Loader";
import { getUserName } from "../utils/Users/getUserName";
import { editMe, updatePasswordMe } from "../http/meApi";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUser,
  updateCurrentUser,
} from "../features/CurrentUser/currentUser";
import { findNestedValue } from "../utils/findNestedValue";
import { handleErrorFields } from "../utils/handleErrorFields";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UpdatePasswordMeModal } from "../components/Modal/UpdatePasswordMeModal";

export const ProfileSettings = () => {
  const [pwdModal, setPwdModal] = useState(false);

  const [form] = Form.useForm();
  const { message } = App.useApp();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const username = getUserName(user && user);

  Form.useWatch("image", form);

  const handleSetAvatar = (icon) => {
    form.setFieldsValue({
      image: icon.url,
      imageFile: icon.file,
    });
  };

  const openPwdModal = () => {
    setPwdModal(true);
  };
  const closePwdModal = () => {
    setPwdModal(false);
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

  const handleSaveChanges = async (values) => {
    values.image = form.getFieldValue("imageFile");

    try {
      const response = await editMe(values);
      if (response) {
        dispatch(updateCurrentUser(response));
        message.success("User updated successfuly!");
        localStorage.removeItem("user");
      }
    } catch (error) {
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  return (
    <MainLayout>
      <Button
        type="primary"
        style={{ marginBottom: 15 }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>
      <PageHeader
        title={"My account"}
        buttons={[
          {
            name: "Change password",
            handler: openPwdModal,
            icon: <LockOutlined />,
          },
        ]}
        size="large"
        margin
      />
      <UpdatePasswordMeModal open={pwdModal} onClose={closePwdModal} />
      {user ? (
        <Form
          layout="vertical"
          size="large"
          form={form}
          onFinish={handleSaveChanges}
          initialValues={{
            first_name: user?.first_name !== "null" ? user.first_name : "",
            last_name: user?.last_name !== "null" ? user.last_name : "",
            username: user?.username !== "null" ? user.username : "",
            email: user?.email !== "null" ? user.email : "",
            phone_number:
              user?.phone_number !== "null" ? user.phone_number : "",
            image: user?.image,
          }}
        >
          <Flex gap={"large"}>
            <Form.Item name="image">
              <Upload
                accept="image/*"
                customRequest={setUserImage}
                beforeUpload={beforeUpload}
                showUploadList={false}
                fileList={
                  form.getFieldValue("image")
                    ? [form.getFieldValue("image")]
                    : []
                }
              >
                <Badge
                  count={<EditFilled style={{ color: "white" }} />}
                  style={{
                    backgroundColor: colors.blue,
                    padding: 8,
                    borderRadius: "50%",
                    top: 10,
                    right: 10,
                    cursor: "pointer",
                  }}
                >
                  <Avatar
                    style={{ cursor: "pointer" }}
                    size={{
                      xs: 32,
                      sm: 40,
                      md: 64,
                      lg: 100,
                      xl: 120,
                      xxl: 140,
                    }}
                    src={form.getFieldValue("image")}
                    icon={<UserOutlined />}
                    alt={"user avatar"}
                  />
                </Badge>
              </Upload>
            </Form.Item>
            <p style={{ fontSize: 24, fontWeight: 500 }}>{username}</p>
          </Flex>
          <Flex gap={"10%"}>
            <Flex vertical>
              <h2>{"Name"}</h2>
              <Form.Item name="first_name" label={"First name"}>
                <Input placeholder={"Enter your first name"} />
              </Form.Item>
              <Form.Item name="last_name" label={"Last name"}>
                <Input placeholder={"Enter your last name"} />
              </Form.Item>
              <Form.Item
                name="username"
                label={"Username"}
                rules={[
                  {
                    required: true,
                    message: "Please enter your new Username!",
                  },
                ]}
              >
                <Input placeholder={"Enter your name"} />
              </Form.Item>
            </Flex>
            <Flex vertical>
              <h2>{"Contacts"}</h2>
              <Form.Item
                name="email"
                label={"Email"}
                rules={[
                  { required: true, message: "Please, enter user`s email" },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <Input placeholder={"Enter your name"} />
              </Form.Item>
              <Form.Item name="phone_number" label={"Phone number"}>
                <Input placeholder={"Enter your name"} />
              </Form.Item>
            </Flex>
          </Flex>
          <Button type="primary" htmlType="submit" style={{ marginTop: 40 }}>
            {"Save changes"}
          </Button>
        </Form>
      ) : (
        <Loader loading />
      )}
    </MainLayout>
  );
};
