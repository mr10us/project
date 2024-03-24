import { $host } from ".";
import { handleErrors } from "../utils/handlers/http";
import { getMe } from "./meApi";

export const login = async (userName, password) => {
  const response = await $host.post("/api/login/", {
    user_identity: userName,
    password: password,
  }, {withCredentials: true});
  localStorage.setItem("key", response.data.key);
  localStorage.setItem("user_id", response.data.user_id);

  handleErrors(response);

  return response.data;
};

export const check = async () => {
  try {
    await getMe();
  } catch (error) {
    if (error?.response?.status === 401) {
      return false;
    }
  }
  return true;
};

export const logout = () => {
  if (check) {
    localStorage.clear();
    document.cookie = "sessionid=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
  }
};

export const destroy = async () => {
  // const user_id = localStorage.getItem("user_id");
};
