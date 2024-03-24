import { Form, App, Input, Flex, Button } from "antd";
import DoubleSide from "./DoubleSide/DoubleSide";
import Logo from "./Logo/Logo";
import { login } from "../http/authApi";
import { useNavigate } from "react-router-dom";
import { routes } from "../consts";
import { handleErrorFields } from "../utils/handleErrorFields";
import { findNestedValue } from "../utils/findNestedValue";

export const LoginForm = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    const user_identity = values.user_identity;
    const password = values.password;
    try {
      const response = await login(user_identity, password);

      if (response) navigate(routes.CUSTOMERS);
    } catch (error) {
      if (error.response?.response?.data) {
        const errorFields = handleErrorFields(error.response.data);
        form.setFields(errorFields);
      }
      const errorMsg = findNestedValue(error?.response?.data || null);
      message.error(errorMsg || error.message);
    }
  };

  return (
    <DoubleSide>
      <div>
        <Logo
          style={{ width: "20%", margin: "15px auto", marginRight: "50%" }}
        />
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ height: "100%", marginTop: -100 }}
        >
          <Form
            layout="vertical"
            size="large"
            form={form}
            onFinish={handleLogin}
            style={{ width: "calc(70% - 50px)" }}
          >
            <h1 style={{ marginBottom: 40 }}>Login</h1>
            <Form.Item
              name="user_identity"
              label={"Username or email"}
              rules={[
                {
                  required: true,
                  message: "Please, enter your username or email",
                },
              ]}
            >
              <Input placeholder={"Enter your username or email"} />
            </Form.Item>
            <Form.Item
              name="password"
              label={"Password"}
              rules={[
                {
                  required: true,
                  message: "Please, enter your password",
                },
              ]}
            >
              <Input.Password placeholder={"Enter your password"} />
            </Form.Item>
            <Flex gap={"medium"} justify="space-between">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button type="link" onClick={() => {}}>
                Forgot Password
              </Button>
            </Flex>
          </Form>
        </Flex>
      </div>
      <div>
        <img
          src="/assets/recoverMachine.jpg"
          alt="machine"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </DoubleSide>
  );
};
