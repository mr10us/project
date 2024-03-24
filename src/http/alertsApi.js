import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getAlerts = async (page = 1, queryParams = {}, customerID) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await $authHost.get(
    `/api/alert/?customer_id=${customerID}&page=${page}${queryString ? "&" + queryString : ""}`
  );

  handleErrors(response);

  return response.data;
};

export const getAlert = async (alertID) => {
  const response = await $authHost.get(`/api/alert/${alertID || ""}/`);

  handleErrors(response);

  return response.data;
};
