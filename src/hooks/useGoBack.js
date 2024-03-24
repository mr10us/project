import { useNavigate } from "react-router-dom";

export const useGoBack = ({options}) => {
  const navigate = useNavigate();
  
  return () => navigate(-1, {options});
};
