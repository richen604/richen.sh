import { displayAtom, store } from "@/app/_store/terminalAtoms";

const handleHelp = () => {
  store.set(displayAtom, (prev) => [
    ...prev,
    JSON.stringify({ componentKey: "help" }),
  ]);
};

export default handleHelp;
