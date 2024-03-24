import { handleErrors } from "../utils/handlers/http";
import { $authHost } from ".";

export const getPackets = async (page = 1, queryParams = {}, customerID) => {
  let queryString = new URLSearchParams(queryParams).toString();
  const response = await $authHost.get(
    `/api/packet/?customer_id=${customerID}&page=${page}${queryString ? "&" + queryString : ""}`
  );

  handleErrors(response);

  return response.data;
};

export const getPacket = async (packetID) => {
  const response = await $authHost.get(`/api/packet/${packetID}/`);
  handleErrors(response);

  return response.data;
};

export const createPacket = async (
  customerID,
  notifyLevel,
  measurements,
  alerts
) => {
  if (customerID === null)
    throw Error("Customer ID is lost, please, reload the page");

  const response = await $authHost.post("/api/packet/", {
    customer_id: customerID,
    notify_level: notifyLevel,
    measurements: measurements,
    alerts: alerts,
  });
  handleErrors(response);

  return response.data;
};

export const editPacket = async (
  packetID,
  customerID,
  notifyLevel,
  measurements,
  alerts
) => {
  if (customerID === null)
    throw Error("Customer ID is lost, please, reload the page");

  const response = await $authHost.put(`/api/packet/${packetID}/`, {
    customer_id: customerID,
    notify_level: notifyLevel,
    measurements: measurements,
    alerts: alerts,
  });
  handleErrors(response);

  return response.data;
};

export const getMeasurements = async (customerID) => {
  const response = await $authHost.get(
    `/api/customer/${customerID}/prepare-measurements/`
  );
  handleErrors(response);

  return response.data;
};

export const uploadMedia = async (file) => {
  const response = await $authHost.post("/api/media-file/", file);
  handleErrors(response);

  return response.data;
};

export const deleteMedia = async (fileID) => {
  const response = await $authHost.delete(`/api/media-file/${fileID}/`);
  handleErrors(response);

  return response.status;
};

// export const editPacket = async (
//   PacketID,
//   mixerModelID,
//   cfModelID,
//   displayedParams,
//   isActive,
//   PacketName
// ) => {
//   const dataToSend = {};

//   if (mixerModelID) dataToSend.mixer_model_id = mixerModelID;
//   if (cfModelID) dataToSend.cutting_fluid_model_id = cfModelID;
//   if (displayedParams) dataToSend.displayed_parameters = displayedParams;
//   if (isActive) dataToSend.is_active = isActive;
//   if (PacketName) dataToSend.name = PacketName;

//   const { status } = await $authHost.patch(
//     `/api/packet/${PacketID}/`,
//     dataToSend
//   );
//   return status;
// };

export const sendPacket = async (packetID) => {
  const response = await $authHost.post(`/api/packet/${packetID}/share/`); 

  handleErrors(response);

  return response.status;
};

export const getExcelPacket = async (packetID) => {
  const response = await $authHost.get(`/api/packet/${packetID}/excel/`);

  handleErrors(response);

  return response.data;
};
export const getPdfPacket = async (packetID) => {
  const response = await $authHost.get(`/api/packet/${packetID}/pdf/`);

  handleErrors(response);

  return response.data;
};

export const removePacket = async (id) => {
  const response = await $authHost.delete(`/api/packet/${id}/`);
  handleErrors(response);

  return response.status;
};
