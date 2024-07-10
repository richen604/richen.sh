import { displayAtom, store } from "@/app/_store/terminalAtoms";

const handle = async (command: string) => {
  store.set(displayAtom, [
    JSON.stringify({
      componentKey: "shader",
      time: new Date().toISOString(),
    }),
  ]);
};

export default handle;
