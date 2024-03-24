import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getMixers = async (query) => {
  const response = await $authHost.get("/api/mixer-model/" + (query !== undefined && "?" + query || ""));

  handleErrors(response);

  return response?.data;
};

export const getMixer = async (mixerID) => {
  const response = await $authHost.get(`/api/mixer-model/${mixerID}/`);

  handleErrors(response);

  return response.data;
};

export const createMixer = async (
  mixerName,
  brandID,
  parameters,
  parentID,
  comment
) => {
  const dataToSend = {
    name: mixerName,
    brand_id: brandID,
    parameters: parameters,
    parent_id: parentID,
    comment: comment,
  };

  const response = await $authHost.post("/api/mixer-model/", dataToSend);

  handleErrors(response);

  return response.status;
};

export const editMixer = async (id, newMixer) => {
  const dataToSend = {
    name: newMixer.mixerName || null,
    brand_id: newMixer.brandID | null,
    parameters: newMixer.parameters || null,
    parent_id: newMixer.parentID || null,
    comment: newMixer.comment || null,
  };

  const response = await $authHost.put(`/api/mixer-model/${id}/`, dataToSend);

  handleErrors(response);

  return response.data;
};

export const removeMixer = async (id) => {
  const response = await $authHost.delete(`/api/mixer-model/${id}/`);

  handleErrors(response);

  return response.status;
};
