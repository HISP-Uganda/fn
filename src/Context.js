import React, { useContext } from "react";

export const D2Context = React.createContext(null);

export function useD2() {
  return useContext(D2Context);
}
