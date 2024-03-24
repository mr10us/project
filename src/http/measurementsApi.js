import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getMeasurements = async (page = 1, queryParams = {}, customerID) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await $authHost.get(`/api/measurement/?customer_id=${customerID}&page=${page}${queryString ? '&' + queryString : ''}`);
  handleErrors(response);
  
  return response.data;
};


export const getMeasurement = async (measurementID) => {
  const response = await $authHost.get("/api/measurement/" + (measurementID || ""));

  handleErrors(response);

  return response.data;
}

export const getMeasurementDates = async (page = 1, queryParams = {}, customerID) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await $authHost.get(`/api/measurement/dates/?customer_id=${customerID}&page=${page}${queryString ? '&' + queryString : ''}`);

  handleErrors(response);
  
  return response.data;
};
