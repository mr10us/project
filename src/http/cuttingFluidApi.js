import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getCuttingFluids = async (query) => {
  const response = await $authHost.get(
    "/api/cutting-fluid-model/" + ((query !== undefined && "?" + query) || "")
  );

  handleErrors(response);

  return response.data;
};

export const getCuttingFluid = async (cfID) => {
  const response = await $authHost.get(`/api/cutting-fluid-model/${cfID}/`);

  handleErrors(response);

  return response.data;
};

export const createCuttingFluid = async (
  cfName,
  brandID,
  parameters,
  parentID,
  comment
) => {
  const dataToSend = {
    name: cfName,
    brand_id: brandID,
    parameters: parameters,
    parent_id: parentID,
    comment: comment || null,
  };

  const response = await $authHost.post(
    "/api/cutting-fluid-model/",
    dataToSend
  );

  handleErrors(response);

  return response.data;
};

export const editCuttingFluid = async (id, newCF) => {
  const dataToSend = {
    name: newCF.name || null,
    brand_id: newCF.brandID || null,
    parameters: newCF.parameters || null,
    parent_id: newCF.parentID || null,
    comment: newCF.comment || null,
  };

  const response = await $authHost.put(
    `/api/cutting-fluid-model/${id}/`,
    dataToSend
  );

  handleErrors(response);

  return response.data;
};

export const removeCuttingFluid = async (id) => {
  const response = await $authHost.delete(`/api/cutting-fluid-model/${id}/`);

  handleErrors(response);

  return response.status;
};
