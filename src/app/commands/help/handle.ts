import { displayAtom, store } from "@/app/store/terminalAtoms";

const handleHelp = () => {
  store.set(displayAtom, (prev) => [
    ...prev,
    JSON.stringify({
      componentKey: "help",
      props: {},
      time: new Date().toISOString(),
    }),
  ]);
};

export default handleHelp;
