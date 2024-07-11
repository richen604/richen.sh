import { useAtom } from "jotai";
import {
  store,
  displayAtom,
  renderedDisplayAtom,
} from "../store/terminalAtoms";

import type { Commands } from "../commands";

const useTerminalDisplay = () => {
  const [display] = useAtom(displayAtom);
  const [renderedDisplay] = useAtom(renderedDisplayAtom);

  const push = (componentKey: Commands, props?: unknown) => {
    const newItem = JSON.stringify({
      componentKey,
      props,
      time: new Date().toISOString(),
    });
    store.set(displayAtom, [...display, newItem]);
  };

  const clear = () => {
    store.set(displayAtom, []);
  };

  const set = (items: { componentKey: Commands; props?: unknown }[]) => {
    const newItems = items.map((item) =>
      JSON.stringify({ ...item, time: new Date().toISOString() })
    );
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
