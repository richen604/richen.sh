"use client";

import { ReactNode } from "react";
import { Provider } from "jotai";

export interface TerminalStoreProviderProps {
  children: ReactNode;
}

export const TerminalStoreProvider = ({
  children,
}: TerminalStoreProviderProps) => {
  return <Provider>{children}</Provider>;
};
