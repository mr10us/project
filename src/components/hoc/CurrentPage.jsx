import { useCurrentPage } from "../../hooks/useGetCurrentPage";
import { routes } from "../../consts";
import { Outlet } from "react-router-dom";

export const CurrentPage = ({ children }) => {
  const currentPage = useCurrentPage();

  if (currentPage !== routes[children.type.name.toUpperCase()])
    return <Outlet />;

  return children;
};
