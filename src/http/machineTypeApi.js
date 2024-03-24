import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getMachineTypes = async (query) => {
  const response = await $authHost.get("/api/machine-type/" + (query || ""));

  handleErrors(response);
  
  return response.data;
};

export const createMachineType = async (typeNames) => {
  const response = await $authHost.post("/api/machine-type/", { name: typeNames });

  handleErrors(response);
  
  return response.data;
};

export const editMachineType = async (id, updatedNames) => {
  const response = await $authHost.patch(`/api/machine-type/${id}/`, {
    name: updatedNames
  });

  handleErrors(response);
  
  return response.data;
};

export const removeMachineType = async (id) => {
  const response = await $authHost.delete(`/api/machine-type/${id}/`);

  handleErrors(response);

  return response.status;
};
