import { useLocation } from "react-router-dom";

export const useGetCurrentPage = () => {
  const { pathname } = useLocation();
  const currentPage = pathname.split("/").filter(Boolean).pop();
  return currentPage;
};
