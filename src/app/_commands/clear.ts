import { type CommandParams } from ".";
import { store, displayAtom } from "../_store/terminalAtoms";

export const handleClear = ({ args, flags }: CommandParams) => {
  if (flags && (flags["-h"] || flags["-help"])) {
    store.set(displayAtom, (prev) => [
      ...prev,
      JSON.stringify({
        componentKey: "echo",
        props: { message: "Usage: clear" },
      }),
    ]);
    return;
  }
  if (args && args.length > 0) {
    store.set(displayAtom, (prev) => [
      ...prev,
      JSON.stringify({
        componentKey: "echo",
        props: { message: "Usage: clear" },
      }),
    ]);
    return;
  }
  store.set(displayAtom, []);
};

export const clearFlags = {
  "-h": handleClear,
  "-help": handleClear,
};
