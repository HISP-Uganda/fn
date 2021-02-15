import { D2Shim } from "@dhis2/app-runtime-adapter-d2";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./components/App";
import { D2Context, StoreContext } from "./Context";
import { Store } from "./Store";

const queryClient = new QueryClient();

const d2Config = {};

// const authorization =
//   process.env.NODE_ENV === "development"
//     ? process.env.REACT_APP_DHIS2_AUTHORIZATION
//     : null;
// if (authorization) {
//   d2Config.headers = { Authorization: authorization };
// }

const AppWrapper = () => {
  return (
    <D2Shim d2Config={d2Config} i18nRoot="./i18n">
      {({ d2 }) => {
        if (!d2) {
          return null;
        }
        const store = new Store();
        return (
          <QueryClientProvider client={queryClient}>
            <StoreContext.Provider value={store}>
              <D2Context.Provider value={d2}>
                <App />
              </D2Context.Provider>
            </StoreContext.Provider>
          </QueryClientProvider>
        );
      }}
    </D2Shim>
  );
};

export default AppWrapper;
