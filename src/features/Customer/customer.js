import { createSelector, createSlice } from "@reduxjs/toolkit";

export const customerSlice = createSlice({
  name: "customer",
  initialState: {
    id: null,
    name: null,
    link: null,
  },
  reducers: {
    setCustomer: (state, { payload }) => {
      if (payload) {
        const { id, name } = payload;
        localStorage.setItem("cuid", id);
        state.id = id;
        state.name = name;
        localStorage.setItem("customer", JSON.stringify(state));
      }
    },
    dropCustomer: (state) => {
      localStorage.removeItem("customer");
      localStorage.removeItem("cuid");
      state.id = null;
      state.name = null;
    },
  },
});

export const { setCustomer, dropCustomer } = customerSlice.actions;

export const selectCustomerID = (state) =>
  localStorage.getItem("cuid") || state.customer.id || null;
export const selectCustomer = createSelector(
  (state) => state.customer,
  (customer) => JSON.parse(localStorage.getItem("customer")) || customer || null
);

export default customerSlice.reducer;
