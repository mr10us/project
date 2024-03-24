import { createSlice } from "@reduxjs/toolkit";
import { routes } from "../../consts";

export const currentPageSlice = createSlice({
  name: "currentPage",
  initialState: { currentPage: routes.CUSTOMERS },
  reducers: {
    setCurrentPage: (state, action) => {
      const { payload } = action;
      if (Object.values(routes).includes(payload)) {
        state.currentPage = payload;
      } else {
        console.error(`Invalid page type: ${payload}`);
      }
    },
  },
});

export const { setCurrentPage } = currentPageSlice.actions;

export const selectCurrentPage = (state) => {
  return state.currentPage.currentPage;
};

export default currentPageSlice.reducer;
