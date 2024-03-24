import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getCustomers = async (query) => {
  const response = await $authHost.get(
    "/api/customer/" + ((query !== undefined && "?" + query) || "")
  );

  handleErrors(response);

  return response.data;
};

export const getCustomer = async (customerID) => {
  const response = await $authHost.get(`/api/customer/${customerID}/`);

  handleErrors(response);

  return response.data;
};

export const getCustomerLite = async (customerID) => {
  const response = await $authHost.get(`/api/customer/${customerID}/lite/`);

  handleErrors(response);

  return response.data;
};

export const createCustomer = async (customerName, mixerID, cfID) => {
  const response = await $authHost.post("/api/customer/", {
    name: customerName,
    mixer_model_id: mixerID,
    cutting_fluid_model_id: cfID,
  });

  handleErrors(response);

  return response.data;
};

export const editCustomer = async (
  customerID,
  mixerModelID,
  cfModelID,
  displayedParams,
  isActive,
  customerName
) => {
  const dataToSend = {};

  if (mixerModelID) dataToSend.mixer_model_id = mixerModelID;
  if (cfModelID) dataToSend.cutting_fluid_model_id = cfModelID;
  if (displayedParams) dataToSend.displayed_parameters = displayedParams;
  if (isActive) dataToSend.is_active = isActive;
  if (customerName) dataToSend.name = customerName;

  const response = await $authHost.patch(
    `/api/customer/${customerID}/`,
    dataToSend
  );

  handleErrors(response);

  return response.status;
};

export const editAbstract = async (customerID, params) => {
  const response = await $authHost.patch(`/api/customer/${customerID}/`, {
    abstract_parameters: params,
  });

  handleErrors(response);
  return response.status;
};

export const calculate = async (customerID, measurements) => {
  const response = await $authHost.post(
    `/api/customer/${customerID}/calculate/`,
    measurements
  );

  handleErrors(response);

  return response.data;
};

export const getCustomerParameters = async (customerID, name) => {
  const response = await $authHost.get(
    `/api/customer/${customerID}/merge/${name}/`
  );

  handleErrors(response);

  return response.data;
};

export const editCustomerMixer = async (customerID, mixerParams) => {
  const response = await $authHost.patch(`/api/customer/${customerID}/`, {
    override_mixer_parameters: mixerParams,
  });

  handleErrors(response);

  return response.status;
};
export const editCustomerCuttingFluid = async (customerID, cfParams) => {
  const response = await $authHost.patch(`/api/customer/${customerID}/`, {
    override_cf_parameters: cfParams,
  });

  handleErrors(response);

  return response.status;
};

export const getDashboardData = async (customerID) => {
  const response = await $authHost.get(
    `/api/customer/${customerID}/dashboard/`
  );

  handleErrors(response);

  return response.data;
};

export const reorderMachines = async (customerID, newOrder) => {
  const response = await $authHost.post(
    `/api/customer/${customerID}/reorder-machines/`,
    { machine_order: newOrder }
  );

  handleErrors(response);

  return response.status;
};

export const removeCustomer = async (id) => {
  const response = await $authHost.delete(`/api/customer/${id}/`);

  handleErrors(response);

  return response.status;
};
