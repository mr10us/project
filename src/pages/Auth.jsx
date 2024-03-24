import DoubleSide from "../components/DoubleSide/DoubleSide";
import Logo from "../components/Logo/Logo";
import { Outlet, useLocation } from "react-router-dom";
import { routes } from "../consts";
import { useState } from "react";
import RecoverModal from "../components/Modal/Recover/RecoverModal";
import AuthForm from "../components/AuthForm/AuthForm";
import { useGetCurrentPage } from "../hooks/useGetCurrentPage";
import { useGetCurrentSize } from "../hooks/useGetCurrentSize";
import { Flex } from "antd";

export const Auth = () => {
  const [isOpen, setIsOpen] = useState(false);

  const currentPage = useGetCurrentPage();
  const { pathname } = useLocation();
  const { width } = useGetCurrentSize();

  const isLogin =
    "/" + currentPage === routes.LOGIN || currentPage === undefined;

  const isAuth = [`${routes.LOGIN}`, `${routes.RECOVER}`, "/"].some(
    (path) => path === pathname
  );

  if (!isAuth) {
    return <Outlet />;
  }

  return (
    <>
      <RecoverModal isOpen={isOpen} toggleModal={setIsOpen} />
      {width < 768 ? (
        <Flex
          align="center"
          vertical
          style={{
            height: "100vh",
            backgroundImage: `url("/assets/recoverMachine.jpg")`,
          }}
        >
          <Logo style={{ width: "20%", margin: "auto", marginTop: 25 }} />
          <Flex
            justify="center"
            vertical
            align="center"
            style={{ height: "100%" }}
          >
            <div style={{backgroundColor: "white", padding: 28, borderRadius: 12}}>
              <div className="textContainer" style={{ marginBottom: 40 }}>
                {isLogin ? <h1>Login</h1> : <h1>Reset password</h1>}
              </div>
              <AuthForm toggleModal={setIsOpen} isLogin={isLogin} />
            </div>
          </Flex>
        </Flex>
      ) : (
        <DoubleSide>
          <div>
            <Logo
              style={{ width: "20%", margin: "15px auto", marginRight: "50%" }}
            />
            <Flex
              justify="center"
              vertical
              align="center"
              style={{ height: "100%", marginTop: -100 }}
            >
              <div className="textContainer" style={{ marginBottom: 40 }}>
                {isLogin ? <h1>Login</h1> : <h1>Reset password</h1>}
              </div>
              <AuthForm toggleModal={setIsOpen} isLogin={isLogin} />
            </Flex>
          </div>
          <div>
            {isLogin ? (
              <img
                src="/assets/recoverMachine.jpg"
                alt="machine"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <img
                src="/assets/loginMachine.jpg"
                alt="machine"
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </div>
        </DoubleSide>
      )}
    </>
  );
};
