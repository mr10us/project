import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getMachineModels = async (query) => {
  const response = await $authHost.get(
    "/api/machine-model/" + (query !== undefined && "?" + query || "")
  );

  handleErrors(response);

  return response.data;
};

export const getMachineModel = async (machineID) => {
  const response = await $authHost.get(`/api/machine-model/${machineID}/`);

  handleErrors(response);

  return response.data;
};

export const createMachineModel = async (
  machineModelName,
  brandID,
  parameters,
  parentID,
  comment,
  machineType
) => {
  const dataToSend = {
    name: machineModelName,
    brand_id: brandID,
    parameters: parameters,
    parent_id: parentID,
    comment: comment || null,
    type_id: machineType,
  };

  const response = await $authHost.post(
    "/api/machine-model/",
    dataToSend
  );

  handleErrors(response);

  return response.status;
};

export const editMachineModel = async (id, newModel) => {
  const dataToSend = {
    name: newModel.name || null,
    brand_id: newModel.brandID || null,
    parameters: newModel.parameters || null,
    parent_id: newModel.parentID || null,
    comment: newModel.comment || null,
    type_id: newModel.typeID || null
  };

  const response = await $authHost.put(
    `/api/machine-model/${id}/`,
    dataToSend
  );

  handleErrors(response);

  return response.data;
};

export const removeMachineModel = async (id) => {
  const response = await $authHost.delete(`/api/machine-model/${id}/`);

  handleErrors(response);
  
  return response.status;
};
