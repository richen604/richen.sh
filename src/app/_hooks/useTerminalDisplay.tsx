"use client";
import { useAtom } from "jotai";
import { displayAtom, renderedDisplayAtom } from "../_store/terminalAtoms";

const useTerminalDisplay = () => {
  const [display, setDisplay] = useAtom(displayAtom);
  const [renderedDisplay] = useAtom(renderedDisplayAtom);

  const push = (componentKey: string, props?: any) => {
    const newItem = JSON.stringify({ componentKey, props });
    setDisplay([...display, newItem]);
  };

  const clear = () => {
    setDisplay([]);
  };

  return {
    display: renderedDisplay,
    push,
    clear,
  };
};

export default useTerminalDisplay;
