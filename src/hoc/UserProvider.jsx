import { useEffect } from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import {
  setCurrentUser,
  setUserDataError,
  setUserDataLoading,
} from "../features/CurrentUser/currentUser";
import { getMe } from "../http/meApi";

export const UserProvider = ({ children }) => {
  const dispatch = useDispatch();

  const {
    isSuccess,
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery("getMe", getMe);

  useEffect(() => {
    if (isLoading) {
      dispatch(setUserDataLoading());
    } else if (isError) {
      dispatch(setUserDataError(error));
    } else if (isSuccess) {
      dispatch(setCurrentUser(user));
    }
  }, [isSuccess, user]);

  return children;
};
