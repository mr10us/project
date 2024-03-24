import { handleErrors } from "../utils/handlers/http";
import { $authHost } from ".";

export const getParameters = async (page = 1, queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await $authHost.get(
    `/api/parameter/?page=${page}${queryString ? "&" + queryString : ""}`
  );

  handleErrors(response);

  return response.data;
};

export const getParameter = async (paramID) => {
  const response = await $authHost.get(`/api/parameter/${paramID}/`);

  handleErrors(response);

  return response.data;
};

export const createParameter = async (
  paramType,
  variableName,
  nameLocale,
  unitLocale,
  shortUnitLocale
) => {
  const response = await $authHost.post("/api/parameter/", {
    type: paramType,
    variable_name: variableName,
    name: nameLocale,
    unit: unitLocale,
    short_unit: shortUnitLocale,
  });

  handleErrors(response);

  return response.data;
};

export const editParameter = async (id, params) => {
  const response = await $authHost.patch(`/api/parameter/${id}/`, {
    ...params,
  });

  handleErrors(response);

  return response.data;
};

export const removeParameter = async (id) => {
  const response = await $authHost.delete(`/api/parameter/${id}/`);

  handleErrors(response);

  return response.status;
};
