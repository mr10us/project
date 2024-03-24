import { createSelector, createSlice } from "@reduxjs/toolkit";
import { useMemo } from "react";

export const currentUserSlice = createSlice({
  name: "currentUser",
  initialState: {
    user: null,
    isSuccess: false,
    isLoading: true,
    isError: false,
    error: "",
  },
  reducers: {
    setUserData: (state, action) => {
      state.isSuccess = true;
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
      state.isLoading = false;
      state.isError = false;
      state.error = null;
    },
    setUserDataLoading: (state) => {
      state.isLoading = true;
    },
    setUserDataError: (state, action) => {
      state.isSuccess = false;
      state.user = null;
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },
    updateCurrentUser: (state, action) => {
      const { payload } = action;
      state.user = payload;
    },
    dropCurrentUser: (state) => {
      state.user = null;
      localStorage.removeItem("user");
      
    },
  },
});

export const {
  setUserData: setCurrentUser,
  setUserDataLoading,
  setUserDataError,
  updateCurrentUser,
  dropCurrentUser,
} = currentUserSlice.actions;

export const selectCurrentUser = () => {
  const localStorageUser = JSON.parse(localStorage.getItem("user"));
  
  return localStorageUser;
};


export default currentUserSlice.reducer;
