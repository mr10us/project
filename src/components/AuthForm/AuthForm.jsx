import { useMemo, useState } from "react";
import { App, Button, Flex, Form, Input, Spin } from "antd";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../http/authApi";
import { routes } from "../../consts";
import { resetPassword } from "../../http/passwordResetApi";
import { handleErrorFields } from "../../utils/handleErrorFields";
import { findNestedValue } from "../../utils/findNestedValue";
import { useGetCurrentSize } from "../../hooks/useGetCurrentSize";

export default function AuthForm({ toggleModal, isLogin }) {
  const [spinning, setSpinning] = useState(false);

  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const loggedIn = localStorage.getItem("key");
  const { width } = useGetCurrentSize();
  const isMobile = width < 768;

  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next");

  const token = useMemo(() => {
    if (!isLogin) {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get("token");
      if (token) return token;
      else return null;
    }
  }, [location.search]);

  const onFinish = async (values) => {
    // Reset Password
    if (values?.confirmPassword)
      try {
        setSpinning(true);
        const response = await resetPassword(token, values.password);
        if (response) {
          message.success("Password changed successful");
          navigate(routes.LOGIN);
        }
      } catch (error) {
        if (error.response?.response?.data) {
          const errorFields = handleErrorFields(error.response.data);
          form.setFields(errorFields);
        }
        const errorMsg = findNestedValue(error?.response?.data || null);
        message.error(errorMsg || error.message);
      } finally {
        setSpinning(false);
      }
    // Login
    else
      try {
        setSpinning(true);
        const response = await login(values.user, values.password);
        if (response) {
          if (next) {
            navigate(next);
          } else navigate(routes.CUSTOMERS);
        }
      } catch (error) {
        if (error.response?.response?.data) {
          const errorFields = handleErrorFields(error.response.data);
          form.setFields(errorFields);
        }
        const errorMsg = findNestedValue(error?.response?.data || null);
        message.error(errorMsg || error.message);
      } finally {
        setSpinning(false);
      }
  };

  if (loggedIn) return <Navigate to={routes.CUSTOMERS} />;

  return (
    <>
      <Spin spinning={spinning} fullscreen />
      <Form
        layout="vertical"
        style={{
          width: isMobile ? "100%" : "40%",
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        autoComplete="off"
        form={form}
      >
        {isLogin ? (
          <>
            <Form.Item
              label="Username or email"
              name="user"
              rules={[
                {
                  required: true,
                  message: "Please enter your username or email",
                },
              ]}
            >
              <Input placeholder="Enter your username or email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
              ]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: "50%" }}>
                Submit
              </Button>
              <Button
                type="link"
                style={{ width: "50%" }}
                onClick={() => toggleModal(true)}
              >
                Forgot Password
              </Button>
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="New password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your new password",
                },
                { min: 4 },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Enter your new password" />
            </Form.Item>
            <Form.Item
              label="Confirm new password"
              name="confirmPassword"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Enter your new password" />
            </Form.Item>
            <Flex
              style={{ width: "50%" }}
              justify="space-between"
              gap={"small"}
            >
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Link to={routes.LOGIN} className="btn" style={{}}>
                Back To Login
              </Link>
            </Flex>
          </>
        )}
      </Form>
    </>
  );
}
