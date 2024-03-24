import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, App } from "antd";
import { routes } from "../consts"; // Make sure to import your routes file

export const CheckForCustomerID = ({ clearPath }) => {
  const [activeWarningMessage, setActiveWarningMessage] = useState(null);

  const navigate = useNavigate();
  const { message } = App.useApp();

  const navigateToCustomers = () => {
    if (activeWarningMessage) {
      setActiveWarningMessage(null);
    }
    navigate(routes.CUSTOMERS, { replace: true });
  };

  useEffect(() => {
    if (clearPath[1] === "null") {
      setActiveWarningMessage(
        message.warning(
          <>
            <p>
              "After the reload, customer id was lost. Please, reselect the
              customer."
            </p>
            <Button type="primary" onClick={navigateToCustomers}>
              Reselect
            </Button>
          </>,
          10
        )
      );

      return () => {
        if (activeWarningMessage) {
          message.destroy(activeWarningMessage);
        }
      };
    }
  }, [clearPath, activeWarningMessage]);

  return null;
};
