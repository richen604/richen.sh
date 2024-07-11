import { type ReactNode } from "react";
import { Provider } from "jotai";
import { store } from "../store/terminalAtoms";
import React from "react";

export interface TerminalStoreProviderProps {
  children: ReactNode;
}

export const TerminalStoreProvider = ({
  children,
}: TerminalStoreProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};
