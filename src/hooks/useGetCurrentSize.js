import { useState, useEffect } from "react";

export const useGetCurrentSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.screen.width,
    height: window.screen.height,
  });

  const handleResize = () => {
    setWindowSize({
      width: window.screen.width,
      height: window.screen.height,
    });
  };

  useEffect(() => {
    setWindowSize({
      width: window.screen.width,
      height: window.screen.height,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
};
