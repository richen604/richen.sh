import { displayAtom, store } from "@/app/_store/terminalAtoms";
import { type CommandParams } from "..";

const handleShader = ({ args, flags }: CommandParams) => {
  console.log(args);
  console.log(flags);

  if (flags)
    // help flag

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
