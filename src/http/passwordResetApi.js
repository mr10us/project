import { $host } from ".";
import { handleErrors } from "../utils/handlers/http";

export const sendResetLetter = async (username) => {
  const response = await $host.post("/api/send-reset-password-letter/", {
    user_identity: username,
  });

  handleErrors(response);

  return response.status;
};

export const resetPassword = async (token, password) => {
  const response = await $host.post("/api/reset-password/", {
    token: token,
    password: password,
  });

  handleErrors(response);

  return response.status;
};
