import { useSelector } from "react-redux";
import { selectCurrentLang } from "../features/CurrentLang/currentLang";

export const useGetCurrentLang = () => {
  const currentLang = useSelector(selectCurrentLang);

  return currentLang;
};
