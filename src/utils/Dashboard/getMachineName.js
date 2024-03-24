function getMachineName(machine) {
  if (!machine) return "";

  const name = `${machine.model.brand.name} ${machine.model.name} (ID ${machine.internal_number})`;

  return name;
}
export default getMachineName;
