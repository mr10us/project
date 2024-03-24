import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getUsers = async (query) => {
  const response = await $authHost.get("/api/user/" + (query !== undefined && "?" + query || ""));
  handleErrors(response);

  return response.data;
};

export const getUser = async (userID) => {
  const response = await $authHost.get(`/api/user/${userID}/`);
  handleErrors(response);

  return response.data;
};

export const createUser = async (
  userName,
  userEmail,
  role,
  nonOptionalParams
) => {
  const dataToSend = new FormData();

  dataToSend.append("username", userName);
  dataToSend.append("email", userEmail);
  dataToSend.append("role", role);

  if (nonOptionalParams?.notify_level !== undefined)
    dataToSend.append("notify_level", nonOptionalParams.notify_level);
  if (nonOptionalParams?.is_active !== undefined)
    dataToSend.append("is_active", nonOptionalParams.is_active);
  if (nonOptionalParams?.first_name !== undefined)
    dataToSend.append("first_name", nonOptionalParams.first_name);
  if (nonOptionalParams?.last_name !== undefined)
    dataToSend.append("last_name", nonOptionalParams.last_name);
    if (nonOptionalParams?.is_staff !== undefined)
    dataToSend.append("is_staff", nonOptionalParams.is_staff);
  if (nonOptionalParams?.image !== undefined)
    dataToSend.append("image", nonOptionalParams.image);
  if (nonOptionalParams?.phone_number !== undefined)
    dataToSend.append("phone_number", nonOptionalParams.phone_number);
  if (nonOptionalParams?.available_customers !== undefined)
    dataToSend.append(
      "available_customers",
      nonOptionalParams.available_customers
    );
  const response = await $authHost.post("/api/user/", dataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  handleErrors(response);

  return response.data;
};

export const editUser = async (userID, nonOptionalParams) => {
  const dataToSend = new FormData();

  if (nonOptionalParams?.username !== undefined)
    if (nonOptionalParams.username === "null") nonOptionalParams.username = "";
  dataToSend.append("username", nonOptionalParams.username);

  if (nonOptionalParams?.email !== undefined)
    if (nonOptionalParams.email === "null") nonOptionalParams.email = "";
  dataToSend.append("email", nonOptionalParams.email);

  if (nonOptionalParams?.role !== undefined)
    if (nonOptionalParams.role === "null") nonOptionalParams.role = "";
  dataToSend.append("role", nonOptionalParams.role);

  if (nonOptionalParams?.notify_level !== undefined)
    dataToSend.append("notify_level", nonOptionalParams.notify_level);

  if (nonOptionalParams?.is_active !== undefined)
    if (nonOptionalParams.is_active === "null")
      nonOptionalParams.is_active = "";
  dataToSend.append("is_active", nonOptionalParams.is_active);

  if (nonOptionalParams?.first_name !== undefined)
    if (nonOptionalParams.first_name === "null")
      nonOptionalParams.first_name = "";
  dataToSend.append("first_name", nonOptionalParams.first_name);

  if (nonOptionalParams?.last_name !== undefined)
    if (nonOptionalParams.last_name === "null")
      nonOptionalParams.last_name = "";
  dataToSend.append("last_name", nonOptionalParams.last_name);

  if (nonOptionalParams?.image !== undefined)
    dataToSend.append("image", nonOptionalParams.image);

  if (nonOptionalParams?.phone_number !== undefined)
    if (nonOptionalParams.phone_number === "null")
      nonOptionalParams.phone_number = "";
  dataToSend.append("phone_number", nonOptionalParams.phone_number);

  if (nonOptionalParams?.available_customers !== undefined)
    dataToSend.append(
      "available_customers",
      nonOptionalParams.available_customers
    );

  const response = await $authHost.patch(`/api/user/${userID}/`, dataToSend, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  handleErrors(response);

  return response.data;
};

export const removeUser = async (id) => {
  const response = await $authHost.delete(`/api/user/${id}/`);
  handleErrors(response);

  return response.status;
};
