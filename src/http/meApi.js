import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getMe = async () => {
  const response = await $authHost.get(`/api/me/`);

  handleErrors(response);

  return response.data;
};

export const editMe = async (userData) => {
  const dataToSend = new FormData();

  if (userData?.username !== undefined)
    dataToSend.append("username", userData.username);
  if (userData?.email !== undefined) dataToSend.append("email", userData.email);
  if (userData?.notify_level !== undefined)
    dataToSend.append("notify_level", userData.notify_level);
  if (userData?.is_active !== undefined)
    dataToSend.append("is_active", userData.is_active);
  if (userData?.role !== undefined) dataToSendappend("role", userData.role);
  if (userData?.first_name !== undefined)
    dataToSend.append("first_name", userData.first_name);
  if (userData?.last_name !== undefined)
    dataToSend.append("last_name", userData.last_name);
  if (userData?.image !== undefined) dataToSend.append("image", userData.image);
  if (userData?.phone_number !== undefined)
    dataToSend.append("phone_number", userData.phone_number);
  if (userData?.available_customers !== undefined)
    dataToSend.append("available_customers", userData.available_customers);

  const response = await $authHost.patch(`/api/me/`, dataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  handleErrors(response);

  return response.data;
};

export const updatePasswordMe = async (oldPassword, newPassword) => {
  const response = await $authHost.put("/api/me/update-password/", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  handleErrors(response);

  return response.data;
};

export const removeMe = async () => {
  const response = await $authHost.patch(`/api/me/`);
  handleErrors(response);

  return response.data;
};
