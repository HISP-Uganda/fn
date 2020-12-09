import { D2Shim } from "@dhis2/app-runtime-adapter-d2";
import React from "react";
import { QueryCache, ReactQueryCacheProvider } from "react-query";
import App from "./components/App";
import { D2Context } from "./Context";

const queryCache = new QueryCache();

const d2Config = {};

const authorization =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_DHIS2_AUTHORIZATION
    : null;
if (authorization) {
  d2Config.headers = { Authorization: authorization };
}

const AppWrapper = () => {
  return (
    <D2Shim d2Config={d2Config} i18nRoot="./i18n">
      {({ d2 }) => {
        if (!d2) {
          return null;
        }
        return (
          <ReactQueryCacheProvider queryCache={queryCache}>
            <D2Context.Provider value={d2}>
              <App />
            </D2Context.Provider>
          </ReactQueryCacheProvider>
        );
      }}
    </D2Shim>
  );
};

export default AppWrapper;
