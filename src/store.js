import { configureStore } from "@reduxjs/toolkit";
import currentPage from "./features/CurrentPage/currentPage";
import currentLang from "./features/CurrentLang/currentLang";
import customer from "./features/Customer/customer";
import currentUser from "./features/CurrentUser/currentUser";

export default configureStore({
  reducer: {
    currentLang,
    currentPage,
    customer,
    currentUser,
  },
});
