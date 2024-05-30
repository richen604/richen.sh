"use client";
import { useAtom } from "jotai";
import {
  store,
  displayAtom,
  renderedDisplayAtom,
} from "../_store/terminalAtoms";

const useTerminalDisplay = () => {
  const [display] = useAtom(displayAtom);
  const [renderedDisplay] = useAtom(renderedDisplayAtom);

  const push = (componentKey: string, props?: unknown) => {
    const newItem = JSON.stringify({ componentKey, props });
    store.set(displayAtom, [...display, newItem]);
  };

  const clear = () => {
    store.set(displayAtom, []);
  };

  return {
    display: renderedDisplay,
    push,
    clear,
  };
};

export default useTerminalDisplay;
