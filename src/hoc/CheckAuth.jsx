import { Navigate, useLocation } from "react-router-dom";
import { check } from "../http/authApi";
import { routes } from "../consts";
import { useEffect, useMemo, useState } from "react";
import { useGetPermissions } from "../hooks/useGetParmissions";
import { NotFound } from "../components/NotFound";

export const CheckAuth = ({ children }) => {
  const [isLogged, setIsLogged] = useState(true);
  const [isNotAdmin, setIsNotAdmin] = useState(false);

  const { pathname } = useLocation();
  const pagePartition = pathname.split("/").filter(Boolean)[0];
  const restrictedPages = ["settings", "users"];
  const { role } = useGetPermissions();

  useEffect(() => {
    check().then((bool) => setIsLogged(bool));
    if (restrictedPages.includes(pagePartition))
      if (role === "admin") setIsNotAdmin(false);
      else return setIsNotAdmin(true);
  }, []);

  if (isLogged) {
    if (isNotAdmin) {
      return <NotFound />;
    }
    return children;
  } else {
    localStorage.clear();
    return <Navigate to={routes.LOGIN} replace />;
  }
};
