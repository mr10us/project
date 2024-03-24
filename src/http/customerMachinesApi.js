import { $authHost } from ".";
import { handleErrors } from "../utils/handlers/http";

export const getCustomerMachines = async (customerID, query) => {
  if (customerID === null)
    throw Error("Customer ID is lost, please, reload the page");

  const response = await $authHost.get(
    "/api/machine/" + (`?customer_id=${customerID}&` + (query || ""))
  );

  handleErrors(response);

  return response.data;
};

export const getCustomerMachine = async (customerID, machineID) => {
  if (customerID === null)
    throw Error("Customer ID is lost, please, reload the page");

  const response = await $authHost.get(
    `/api/machine/${machineID}/?customer_id=${customerID}`
  );

  handleErrors(response);

  return response.data;
};

export const getCustomerMachineParameters = async (machineID, name) => {
  const response = await $authHost.get(
    `/api/machine/${machineID}/merge/${name}/`
  );

  handleErrors(response);

  return response.data;
};

export const createCustomerMachine = async (
  customerID,
  modelID,
  cfModelID,
  ordinalNumber,
  internalNumber,
  isActive
) => {
  const dataToSend = {
    customer_id: customerID,
    model_id: modelID,
    cutting_fluid_model_id: cfModelID,
    ordinal_number: ordinalNumber,
    internal_number: internalNumber,
    is_active: isActive || true,
  };

  const response = await $authHost.post("/api/machine/", dataToSend);

  handleErrors(response);

  return response.data;
};

export const editCustomerMachine = async (
  machineID,
  modelID,
  cfModelID,
  internalNumber,
  isActive,
  ordinalNumber,
  customerID
) => {
  const dataToSend = {};

  if (modelID) dataToSend.model_id = modelID;
  if (cfModelID || cfModelID === null)
    dataToSend.cutting_fluid_model_id = cfModelID;
  if (ordinalNumber) dataToSend.ordinal_number = ordinalNumber;
  if (internalNumber) dataToSend.internal_number = internalNumber;
  if (isActive || isActive === false) dataToSend.is_active = isActive;

  const response = await $authHost.patch(
    `/api/machine/${machineID}/`,
    dataToSend
  );

  handleErrors(response);

  return response.data;
};

export const editCustomerMachineModelParams = async (machineID, parameters) => {
  const dataToSend = { override_model_parameters: parameters };

  const response = await $authHost.patch(
    `/api/machine/${machineID}/`,
    dataToSend
  );

  handleErrors(response);

  return response.data;
};

export const editCustomerMachineCFParams = async (machineID, parameters) => {
  const dataToSend = { override_cf_parameters: parameters };

  const response = await $authHost.patch(
    `/api/machine/${machineID}/`,
    dataToSend
  );

  handleErrors(response);

  return response.data;
};

export const removeCustomerMachine = async (machineID) => {
  const response = await $authHost.delete(`/api/machine/${machineID}/`);

  handleErrors(response);

  return response.status;
};
