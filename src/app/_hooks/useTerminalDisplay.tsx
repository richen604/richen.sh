"use client";
import { useAtom } from "jotai";
import {
  store,
  displayAtom,
  renderedDisplayAtom,
} from "../_store/terminalAtoms";

import type { Commands } from "../_commands";

const useTerminalDisplay = () => {
  const [display] = useAtom(displayAtom);
  const [renderedDisplay] = useAtom(renderedDisplayAtom);

  const push = (componentKey: Commands, props?: unknown) => {
    const newItem = JSON.stringify({ componentKey, props });
    store.set(displayAtom, [...display, newItem]);
  };

  const clear = () => {
    store.set(displayAtom, []);
  };

  const set = (items: { componentKey: Commands; props?: unknown }[]) => {
    const newItems = items.map((item) => JSON.stringify(item));
    store.set(displayAtom, newItems);
  };

  return {
    display: renderedDisplay,
    push,
    clear,
    set,
  };
};

export default useTerminalDisplay;
