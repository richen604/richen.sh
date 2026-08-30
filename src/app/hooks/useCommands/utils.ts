import commandRegistry, {
  type Commands,
  type CommandParams,
} from "../../commands";
import { store, displayAtom } from "../../store";
export { parseArgsAndFlags, parseCommandArgs } from "./parsing";

export const handleCommand = ({
  command,
  args,
  flags,
  all,
  timestamp,
  filesystem,
}: CommandParams & { command: Commands }) => {
  if (command in commandRegistry) {
    store.set(displayAtom, (prev) => [
      ...prev,
      JSON.stringify({
        componentKey: command,
        props: { args, flags, all, filesystem },
        timestamp,
      }),
    ]);
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
};
