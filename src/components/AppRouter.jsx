import React from "react";
import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { _routes } from "../consts";
import { Auth } from "../pages/Auth";
import { Customers } from "../pages/Customers/Customers";
import { Users } from "../pages/Users/Users";
import { User } from "../pages/Users/User";
import { CFModels } from "../pages/Settings/CF/CFModels";
import { CreateCFM } from "../pages/Settings/CF/CreateCFM";
import { EditCFM } from "../pages/Settings/CF/EditCFM";
import { CreateMachineModel } from "../pages/Settings/Machines/CreateMachineModel";
import { EditMachineModel } from "../pages/Settings/Machines/EditMachineModel";
import { CreateChildModel } from "../pages/Settings/Machines/CreateChildModel";
import { MachineTypes } from "../pages/Settings/Machines/MachineTypes";
import { MachineModels } from "../pages/Settings/Machines/MachineModels";
import { MixerModels } from "../pages/Settings/Mixers/MixerModels";
import { CreateMixer } from "../pages/Settings/Mixers/CreateMixer";
import { EditMixer } from "../pages/Settings/Mixers/EditMixers";
import { Parameters } from "../pages/Settings/Parameters/Parameters";
import { AddParameter } from "../pages/Settings/Parameters/AddParameter";
import { EditParameter } from "../pages/Settings/Parameters/EditParameter";
import { Brands } from "../pages/Settings/Brands";
import { Dashboard } from "../pages/Customers/Dashboard/Dashboard";
import { CustomerUsers } from "../pages/Customers/Users/CustomerUsers";
import { Settings } from "../pages/Customers/Settings/Settings";
import { SettingsLayout } from "../layouts/SettingsLayout";
import { CustomersLayout } from "../layouts/CustomersLayout";
import { NotFound } from "./NotFound";
import { AbstractParams } from "../pages/Customers/Settings/AbstractParams";
import { EditCustomerCuttingFluid } from "../pages/Customers/Settings/EditCustomerCuttingFluid";
import { EditCustomerMixer } from "../pages/Customers/Settings/EditCustomerMixer";
import { AddCustomerUser } from "../pages/Customers/Users/AddCustomerUser";
import { EditCustomerUser } from "../pages/Customers/Users/EditCustomerUser";
import { CustomerMachines } from "../pages/Customers/Machines/CustomerMachines";
import { CustomerMachine } from "../pages/Customers/Machines/CustomerMachine";
import { EditCustomerMachineModel } from "../pages/Customers/Machines/EditCustomerMachineModel";
import { EditCustomerMachineCF } from "../pages/Customers/Machines/EditCustomerMachineCF";
import { Packets } from "../pages/Customers/Packets/Packets";
import { Packet } from "../pages/Customers/Packets/Packet/Packet";
import { CreatePacket } from "../pages/Customers/Packets/Packet/CreatePacket";
import { CheckAuth } from "../hoc/CheckAuth";
import { Alerts } from "../pages/Customers/Alerts/Alerts";
import { Alert } from "../pages/Customers/Alerts/Alert";
import { AllMeasurements } from "../pages/Customers/Measurements/AllMeasurements";
import { DailyMeasurements } from "../pages/Customers/Measurements/DailyMeasurement";
import { MachineMeasurement } from "../pages/Customers/Measurements/MachineMeasurement";
import { ProfileSettings } from "../pages/ProfileSettings";
import { LoginForm } from "./LoginForm";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Auth />}>
      <Route path={_routes.LOGIN} element={<Auth />} />
      <Route path={_routes.RECOVER} element={<Auth />} />
      <Route
        path={_routes.CUSTOMERS}
        element={
          <CheckAuth>
            <Customers />
          </CheckAuth>
        }
      />
      <Route
        path={_routes.PROFILESETTINGS}
        element={
          <CheckAuth>
            <ProfileSettings />
          </CheckAuth>
        }
      />
      <Route
        path={_routes.CUSTOMER + "*"}
        element={
          <CheckAuth>
            <CustomersLayout />
          </CheckAuth>
        }
      >
        <Route
          path={_routes.DASHBOARD}
          element={
            <CheckAuth>
              <Dashboard />
            </CheckAuth>
          }
        />
        <Route path="*" element={<NotFound />} />

        <Route
          path={_routes.CUSTOMERSETTINGS + "*"}
          element={
            <CheckAuth>
              <Settings />
            </CheckAuth>
          }
        >
          <Route
            path={_routes.ABSTRACTPARAMS}
            element={
              <CheckAuth>
                <AbstractParams />
              </CheckAuth>
            }
          />
        </Route>
        <Route
          path={_routes.EDITCUSTOMERCF}
          element={
            <CheckAuth>
              <EditCustomerCuttingFluid />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.EDITCUSTOMERMIXER}
          element={
            <CheckAuth>
              <EditCustomerMixer />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.CUSTOMERUSERS + "*"}
          element={
            <CheckAuth>
              <CustomerUsers />
            </CheckAuth>
          }
        >
          <Route
            path={_routes.ADDCUSTOMERUSER}
            element={
              <CheckAuth>
                <AddCustomerUser />
              </CheckAuth>
            }
          />
          <Route
            path={_routes.EDITCUSTOMERUSER}
            element={
              <CheckAuth>
                <EditCustomerUser key={EditCustomerUser.name} />
              </CheckAuth>
            }
          />
        </Route>
        <Route
          path={_routes.CUSTOMERMACHINES}
          element={
            <CheckAuth>
              <CustomerMachines />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.CUSTOMERMACHINE}
          element={
            <CheckAuth>
              <CustomerMachine />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.EDITCUSTOMERMACHINEMODEL}
          element={
            <CheckAuth>
              <EditCustomerMachineModel />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.EDITCUSTOMERMACHINECF}
          element={
            <CheckAuth>
              <EditCustomerMachineCF />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.CUSTOMERPACKETS}
          element={
            <CheckAuth>
              <Packets />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.CUSTOMERPACKETCREATE}
          element={
            <CheckAuth>
              <CreatePacket />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.CUSTOMERPACKET}
          element={
            <CheckAuth>
              <Packet />
            </CheckAuth>
          }
        />
        <Route path={_routes.CUSTOMERREPORTSALERTS + "*"} element={<Alerts />}>
          <Route path={_routes.CUSTOMERREPORTSALERT} element={<Alert />} />
        </Route>

        <Route
          path={_routes.CUSTOMERREPORTSMEASUREMENTSALL}
          element={<AllMeasurements />}
        />
        <Route
          path={_routes.CUSTOMERREPORTSMEASUREMENTSDAILY}
          element={<DailyMeasurements />}
        />
        <Route
          path={_routes.CUSTOMERREPORTSMEASUREMENTSMACHINE}
          element={<MachineMeasurement />}
        />
      </Route>

      <Route
        path={_routes.USERS + "*"}
        element={
          <CheckAuth>
            <Users />
          </CheckAuth>
        }
      >
        <Route
          path={_routes.USER}
          element={
            <CheckAuth>
              <User />
            </CheckAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path={_routes.SETTINGS + "*"}
        element={
          <CheckAuth>
            <SettingsLayout />
          </CheckAuth>
        }
      >
        <Route
          path={_routes.MACHINES}
          element={
            <CheckAuth>
              <MachineModels />
            </CheckAuth>
          }
        />

        <Route
          path={_routes.CREATEMACHINE}
          element={
            <CheckAuth>
              <CreateMachineModel />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.MACHINETYPES}
          element={
            <CheckAuth>
              <MachineTypes />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.EDITMACHINEMODEL}
          element={
            <CheckAuth>
              <EditMachineModel />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.CREATECHILDMODEL}
          element={
            <CheckAuth>
              <CreateChildModel />
            </CheckAuth>
          }
        />

        <Route
          path={_routes.CF}
          element={
            <CheckAuth>
              <CFModels />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.CREATECFM}
          element={
            <CheckAuth>
              <CreateCFM />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.EDITCFM}
          element={
            <CheckAuth>
              <EditCFM />
            </CheckAuth>
          }
        />

        <Route
          path={_routes.MIXERS}
          element={
            <CheckAuth>
              <MixerModels />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.CREATEMIXER}
          element={
            <CheckAuth>
              <CreateMixer />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.EDITMIXER}
          element={
            <CheckAuth>
              <EditMixer />
            </CheckAuth>
          }
        />

        <Route
          path={_routes.PARAMETERS}
          element={
            <CheckAuth>
              <Parameters />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.ADDPARAMETER}
          element={
            <CheckAuth>
              <AddParameter />
            </CheckAuth>
          }
        />
        <Route
          path={_routes.EDITPARAMETER}
          element={
            <CheckAuth>
              <EditParameter />
            </CheckAuth>
          }
        />

        <Route
          path={_routes.BRANDS}
          element={
            <CheckAuth>
              <Brands />
            </CheckAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function AppRouter() {
  const isAuth = true;

  return isAuth ? router : null;
}
