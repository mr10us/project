import { createSlice } from "@reduxjs/toolkit";
import { langs } from "../../consts";
import i18n from "../../i18n";

export const currentLangSlice = createSlice({
  name: "currentLang",
  initialState: localStorage.getItem("lang") || langs.ENGLISH,
  reducers: {
    changeLang(state, { payload }) {
      if (Object.values(langs).includes(payload)) {
        localStorage.setItem("lang", payload)
        i18n.changeLanguage(payload);
        return payload;
      }
      return state;
    },
  },
});

export const { changeLang } = currentLangSlice.actions;

export const selectCurrentLang = (state) => state.currentLang;

export default currentLangSlice.reducer;
