export const _routes = {
  LOGIN: "/login",

  RECOVER: "/reset-password",

  PROFILESETTINGS: "/profile-settings/",

  CUSTOMERS: "/customers/",

  CUSTOMER: "/customers/:customer/",

  DASHBOARD: "dashboard/",
  CUSTOMERSETTINGS: "settings/",
  ABSTRACTPARAMS: "abstract-parameters/",
  EDITCUSTOMERMIXER: "settings/edit-mixer/",
  EDITCUSTOMERCF: "settings/edit-cf/",
  CUSTOMERUSERS: "users/",
  ADDCUSTOMERUSER: "add/",
  EDITCUSTOMERUSER: ":user/",
  CUSTOMERMACHINES: "machines/",
  CUSTOMERMACHINE: "machines/:machine/",
  EDITCUSTOMERMACHINEMODEL: "machines/:machine/edit-model/",
  EDITCUSTOMERMACHINECF: "machines/:machine/edit-cf/",
  CUSTOMERPACKETS: "packets/",
  CUSTOMERPACKETCREATE: "packets/create/",
  CUSTOMERPACKET: "packets/:packet/",
  CUSTOMERREPORTS: "reports/",
  CUSTOMERREPORTSALERTS: "alerts/",
  CUSTOMERREPORTSALERT: ":alert/",
  CUSTOMERREPORTSMEASUREMENTSALL: "measurements/all/",
  CUSTOMERREPORTSMEASUREMENTSDAILY: "measurements/daily/",
  CUSTOMERREPORTSMEASUREMENTSMACHINE: "measurements/machine/",

  USERS: "/users/",
  USER: ":user",

  SETTINGS: "/settings/",

  MACHINES: "machine-models/",

  MACHINETYPES: "machine-models/types/",
  CREATEMACHINE: "machine-models/create/",
  CREATECHILDMODEL: "machine-models/create-child/",
  EDITMACHINEMODEL: "machine-models/:model/",

  CF: "cf-models/",
  CREATECFM: "cf-models/create/",
  EDITCFM: "cf-models/:cf/",

  MIXERS: "mixer-models/",
  CREATEMIXER: "mixer-models/create/",
  EDITMIXER: "mixer-models/:mixer/",

  PARAMETERS: "parameters/",
  ADDPARAMETER: "parameters/add/",
  EDITPARAMETER: "parameters/:parameter/",

  BRANDS: "brands/",
};

export const routes = {
  LOGIN: "/login",

  RECOVER: "/reset-password/",

  CUSTOMERS: "/customers/",
  CUSTOMER: ":customer/",

  PROFILESETTINGS: "/profile-settings/",

  DASHBOARD: "dashboard/",
  CUSTOMERSETTINGS: "settings/",
  ABSTRACTPARAMS: "abstract-parameters/",
  EDITCUSTOMERMIXER: "edit-mixer/",
  EDITCUSTOMERCF: "edit-cf/",
  CUSTOMERUSERS: "users/",
  ADDCUSTOMERUSER: "add/",
  EDITCUSTOMERUSER: ":user/",
  CUSTOMERMACHINES: "machines/",
  CUSTOMERMACHINE: ":machine/",
  EDITCUSTOMERMACHINEMODEL: "edit-model/",
  EDITCUSTOMERMACHINECF: "edit-cf/",
  CUSTOMERPACKETS: "packets/",
  CUSTOMERPACKETCREATE: "create/",
  CUSTOMERPACKET: ":packet/",
  CUSTOMERREPORTS: "reports/",
  CUSTOMERREPORTSALERTS: "alerts/",
  CUSTOMERREPORTSALERT: ":alert/",
  CUSTOMERREPORTSMEASUREMENTSALL: "measurements/all/",
  CUSTOMERREPORTSMEASUREMENTSDAILY: "measurements/daily/",
  CUSTOMERREPORTSMEASUREMENTSMACHINE: "measurements/machine/",

  USERS: "/users/",
  USER: ":user",

  SETTINGS: "/settings/",

  MACHINES: "machine-models/",

  MACHINETYPES: "types/",
  CREATEMACHINE: "create/",
  CREATECHILDMODEL: "create-child",
  EDITMACHINEMODEL: ":model/",

  CF: "cf-models/",
  CREATECFM: "create/",
  EDITCFM: ":cf/",

  MIXERS: "mixer-models/",
  CREATEMIXER: "create/",
  EDITMIXER: ":mixer/",

  PARAMETERS: "parameters/",
  ADDPARAMETER: "add/",
  EDITPARAMETER: ":parameter/",

  BRANDS: "brands/",
};

export const colors = {
  gray: "#9ca3af",
  darkGray: "#6c6c6c",
  lightGray: "#f8f8f8",
  blue: "#116acc",
  lightBlue: "#f3f9ff",
  blueHover: "#e3f0ff",
  darkBlue: "#182233",
  red: "#fd4e5d",
  good: "#20725e",
  goodBg: "#b9ece1",
  suspicious: "#f1f528",
  suspiciousBg: "#feffd2",
  warning: "#fbc756",
  warningBg: "#f9e2af",
  critical: "#ba0000",
  criticalBg: "#ffa2a2",
  lightBlack: "#333",
  mainLightGray: "#d9d9d9",
};

export const settingPages = {
  MACHINES: "machine-models",
  CUTTING_FLUIDS: "cf-models",
  MIXERS: "mixer-models",
  PARAMETERS: "parameters",
  BRANDS: "brands",
};

export const customerPages = {
  DASHBOARD: "dashboard",
  SETTINGS: "settings",
  USERS: "users",
  MACHINES: "machines",
  PACKETS: "packets",
  ALERTS: "alerts",
  ALL: "all",
  DAILY: "daily",
  FOR_MACHINE: "machine",
};

export const alertLevels = {
  good: "good",
  suspicious: "suspicious",
  warning: "warning",
  critical: "critical",
};

export const defaultOptions = [
  { value: "machine", label: "Machine Parameter", key: 1 },
  { value: "cf", label: "Cutting Fluid Parameter", key: 2 },
  { value: "mixer", label: "Mixer Parameter", key: 3 },
  { value: "abstract", label: "Abstract Parameter", key: 4 },
];

export const langs = {
  ENGLISH: "en",
  // ESTONIAN: "et",
  // LATVIAN: "lt",
  // RUSSIAN: "ru",
  // POLISH: "pl",
};

export const roles = {
  admin: "Admin",
  operator: "Operator",
  guest: "Guest",
};

export const statuses = {
  0: "Inactive",
  1: "Active",
};

export const initialEvals = [
  {
    good: {
      min: { formula: "", include: false },
      max: { formula: "", include: false },
    },
  },
  {
    suspicious: {
      min: { formula: "", include: false },
      max: { formula: "", include: false },
    },
  },
  {
    warning: {
      min: { formula: "", include: false },
      max: { formula: "", include: false },
    },
  },
  {
    critical: {
      min: { formula: "", include: false },
      max: { formula: "", include: false },
    },
  },
];

const ascii_lowercase = "abcdefghijklmnopqrstuvwxyz";
const ascii_uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ascii_letters = ascii_lowercase + ascii_uppercase;
const digits = "0123456789";

export const VALID_VARIABLE_NAME_CHARS = ascii_letters + "_";
export const OPERATIONS_CHARS = digits + "+-/%*() ";

export const decimalPrecision = 7;
