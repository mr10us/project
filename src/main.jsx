import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n.js";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store.js";
import { App, ConfigProvider, message } from "antd";
import { colors } from "./consts.js";
import { router } from "./components/AppRouter.jsx";
import { QueryClient, QueryClientProvider } from "react-query";

// Dayjs locales
import "dayjs/locale/ru";
import "dayjs/locale/en";
import "dayjs/locale/lt";
import "dayjs/locale/lv";

// Antd locales

import ru_RU from "antd/lib/locale/ru_RU";
import en_US from "antd/lib/locale/en_US";
import lt_LT from "antd/lib/locale/lt_LT";
import lv_LV from "antd/lib/locale/lv_LV";

const locales = {
  ru: { antd: ru_RU, dayjs: "ru" },
  en: { antd: en_US, dayjs: "en" },
  lt: { antd: lt_LT, dayjs: "lt" },
  lv: { antd: lv_LV, dayjs: "lv" },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

message.config({
  duration: 3, // Установка времени действия сообщений в 5 секунд
});

const locale = navigator.language;
const currentLocale = locales[locale] ? locales[locale].antd : locales.en.antd;

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ConfigProvider
          locale={currentLocale}
          theme={{
            components: {
              Layout: {
                headerHeight: 77,
                headerBg: "#fff",
                bodyBg: "#fff",
              },
              Table: {
                headerBg: "#f0f0f0",
              },
              Form: {
                labelColor: colors.label,
              },
              Tabs: {
                cardBg: colors.lightGray,
                itemColor: colors.blue,
                itemSelectedColor: colors.blue,
              },
              Segmented: {
                itemColor: colors.mainLightGray,
                itemHoverColor: colors.blue,
                itemSelectedBg: colors.blue,
                itemSelectedColor: "white",
              },
            },
            token: {
              // Seed Token
              colorPrimary: colors.blue,
              colorBgLayout: "#fff",
              fontFamily: "Ubuntu",

              // Alias Token
            },
          }}
        >
          <App>
            <RouterProvider router={router} />
          </App>
        </ConfigProvider>
      </Provider>
    </I18nextProvider>
  </QueryClientProvider>
);
