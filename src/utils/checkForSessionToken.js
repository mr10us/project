import { useNavigate } from "react-router-dom";
import { routes } from "../consts";

export const checkForSessionToken = (detail) => {
  const navigate = useNavigate();

  if (detail === "Invalid token.") {
    localStorage.removeItem("key");
    navigate(routes.LOGIN);
  }
};
