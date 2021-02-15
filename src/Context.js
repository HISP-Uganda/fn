import React, { useContext } from "react";

export const D2Context = React.createContext(null);

export function useD2() {
  return useContext(D2Context);
}


export const StoreContext = React.createContext(null);

export function useStore(mapStateToProps) {
  const store = useContext(StoreContext);

  if (typeof mapStateToProps !== 'undefined') {
    return mapStateToProps(store);
  }
  return store;
}
