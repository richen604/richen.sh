import { displayAtom, store } from "@/app/store/terminalAtoms";
import UAParser from "ua-parser-js";

const handleNeofetch = () => {
  const parser = new UAParser();
  const result = parser.getResult();

  store.set(displayAtom, [
    JSON.stringify({
      componentKey: "neofetch",
      props: { result },
      time: new Date().toISOString(),
    }),
  ]);
};

export default handleNeofetch;
