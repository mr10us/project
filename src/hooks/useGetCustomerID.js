import { useSelector } from "react-redux";
import { selectCustomerID } from "../features/Customer/customer";

export const useGetCustomerID = () => {
  const customerID = useSelector(selectCustomerID);
  

  return customerID;
};
