import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getBrands = async (query) => {
  const response = await $authHost.get("/api/brand/" + (query !== undefined && "?" + query || ""));

  handleErrors(response);

  return response.data;
};

export const createBrand = async (brandName) => {
  const response = await $authHost.post("/api/brand/", { name: brandName });

  handleErrors(response);

  return response.data;
};

export const editBrand = async (id, updatedName) => {
  const response = await $authHost.put(`/api/brand/${id}/`, {
    name: updatedName,
  });

  handleErrors(response);

  return response.data;
};

export const removeBrand = async (id) => {
  const response = await $authHost.delete(`/api/brand/${id}/`);

  handleErrors(response);
  
  return response.status;
};
