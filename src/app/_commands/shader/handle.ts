import { displayAtom, store } from "@/app/_store/terminalAtoms";
import { type CommandParams } from "..";

const handleShader = ({ args, flags }: CommandParams) => {
  store.set(displayAtom, [
    JSON.stringify({
      componentKey: "shader",
      time: new Date().toISOString(),
      props: {
        args,
        flags,
      },
    }),
  ]);
};

export default handleShader;
