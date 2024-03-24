import { App } from "antd";
import { useBlocker } from "react-router";
import { useEffect, useState } from "react";

export const useConfirmLeave = (approveLeave) => {
  const [isDirty, setIsDirty] = useState(false);

  const blocker = useBlocker(() => {
    if (approveLeave) return Boolean(isDirty);
    else return true;
  });

  const { modal } = App.useApp();

  const isBlocked = () => {
    return blocker.state === "blocked";
  };
  const handleOk = () => {
    blocker.proceed();
  };
  const handleCancel = () => {
    blocker.reset();
  };

  const showConfirm = () => {
    modal.confirm({
      title: "Are you sure you want to leave?",
      content: "All entered information will be lost.",
      centered: true,
      onOk: handleOk,
      onCancel: handleCancel,
    });
  };

  const handleInput = () => {
    setIsDirty(true);
  };

  useEffect(() => {
    if (isBlocked()) {
      showConfirm();
    }
    return () => {
      if (blocker.status === "blocked") {
        handleOk();
      }
    };
  }, [blocker]);

  useEffect(() => {
    window.addEventListener("input", handleInput);

    return () => {
      window.removeEventListener("input", handleInput);
    };
  }, []);

  useEffect(() => {
      const beforeUnloadHandler = (e) => {
        if (approveLeave) {
          e.preventDefault();
          e.returnValue = true;
        }
      };
  
      window.addEventListener("beforeunload", beforeUnloadHandler);
  
      return () => {
        window.removeEventListener("beforeunload", beforeUnloadHandler);
      };
    }, [approveLeave]);
};
