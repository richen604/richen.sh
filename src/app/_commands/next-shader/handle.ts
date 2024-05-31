"use-client";
import { displayAtom, store } from "@/app/_store/terminalAtoms";

const handleNextShader = () => {
  store.set(displayAtom, (prev) => [
    ...prev,
    JSON.stringify({ componentKey: "next-shader" }),
  ]);
};

export default handleNextShader;
