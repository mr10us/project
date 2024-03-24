import { Layout } from "antd";
import { Header } from "../components/Header/Header";
import { UserProvider } from "../hoc/UserProvider";

export const MainLayout = ({ children }) => {;

  return (
    <UserProvider>
      <Layout style={{ minHeight: "100vh" }} hasSider={false}>
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.Content
          style={{ padding: "0 50px", marginTop: 64, marginBottom: 64 }}
        >
          {children}
        </Layout.Content>
      </Layout>
    </UserProvider>
  );
};
