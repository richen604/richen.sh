import commandRegistry, {
  type Commands,
  type CommandParams,
} from "../../commands";
import { store, displayAtom } from "../../store";
import { blogPath, navigate } from "../../../blog/routes";
export { parseArgsAndFlags, parseCommandArgs } from "./parsing";

export const handleCommand = ({
  command,
  args,
  flags,
  all,
  timestamp,
  filesystem,
}: CommandParams & { command: Commands }) => {
  if (command === "clear") {
    store.set(displayAtom, []);
    navigate("/", true, undefined, 0);
    return;
  }
  if (Object.hasOwn(commandRegistry, command)) {
    store.set(displayAtom, (prev) => [
      ...prev,
      JSON.stringify({
        componentKey: command,
        props: { args, flags, all, filesystem },
        timestamp,
      }),
    ]);
    if (command === "blog") {
      const path = blogPath(args);
      navigate(path ?? "/", true, store.get(displayAtom).length);
    } else if (window.location.pathname.startsWith("/blog/")) navigate("/", true);
  } else {
    handleUnknown(command);
  }
};

export const handleUnknown = (command: string) => {
  store.set(displayAtom, (prev) => [
    ...prev,
    JSON.stringify({
      componentKey: `${command}: command not found`,
      props: { args: [] },
      timestamp: new Date().toISOString(),
    }),
  ]);
  if (window.location.pathname.startsWith("/blog/")) navigate("/", true);
};
