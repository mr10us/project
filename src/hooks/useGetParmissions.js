import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/CurrentUser/currentUser";

export const useGetPermissions = () => {
  const user = useSelector(selectCurrentUser);

  return {
    role: user?.role,
    isStaff: user?.is_staff,
    available_customers: user?.available_customers,
  };
};
