import { displayAtom, store } from "@/app/_store/terminalAtoms";
import { type CommandParams } from "..";

export const handleEcho = ({ all }: CommandParams) => {
  const message = all?.join(" ") ?? "";
  store.set(displayAtom, (prev) => [
    ...prev,
    JSON.stringify({ componentKey: "echo", props: { message } }),
  ]);
};
