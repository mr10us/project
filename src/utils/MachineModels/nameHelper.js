export const getMachineModelName = (machineModel) => {
  const machineModelName = `${machineModel.brand.name} ${machineModel.name}`;
  return machineModelName;
};

export const getCustomerMachineName = (machine) => {
  const machineName = `ID ${machine.internal_number} (${machine.model.brand.name} ${machine.model.name})`;
  
  return machineName;
};
