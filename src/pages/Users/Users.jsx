import { Outlet } from "react-router-dom";
import { UsersContainer } from "../../components/UsersContainer/UsersContainer";
import { useGetCurrentPage } from "../../hooks/useGetCurrentPage";
import { MainLayout } from "../../layouts/MainLayout";

export const Users = () => {
  if (useGetCurrentPage() !== "users") return <Outlet />;
  
  return (
    <MainLayout>
      <UsersContainer />
    </MainLayout>
  );
};
