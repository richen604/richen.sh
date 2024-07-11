import commandRegistry, {
  type Commands,
  type CommandParams,
} from "../../commands";
import { store, displayAtom } from "../../store/terminalAtoms";

export const handleCommand = ({
  command,
  args,
  flags,
  all,
}: CommandParams & { command: Commands }) => {
  const commandHandler = commandRegistry[command];

  if (commandHandler) {
    commandHandler({ args, flags, all });
  } else {
    handleUnknown(command);
  }
};

export const handleUnknown = (command: string) => {
  store.set(displayAtom, (prev) => [
    ...prev,
    JSON.stringify({
      componentKey: command,
      props: { message: `richen.sh: command not found: ${command}` },
      time: new Date().toISOString(),
    }),
  ]);
};

export const parseArgsAndFlags = (args: string[]) => {
  const flags: Record<string, string[]> = {};
  const filteredArgs: string[] = [];
  const all: string[] = [];

  args.forEach((arg, index) => {
    if (arg.startsWith("-")) {
      const flag = arg;
      const nextArg = args[index + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        if (!flags[flag]) {
          flags[flag] = [];
        }
        flags[flag].push(nextArg);
      } else {
        flags[flag] = [];
      }
    } else if (!args[index - 1]?.startsWith("-")) {
      filteredArgs.push(arg);
    }
    all.push(arg);
  });

  return { args: filteredArgs, flags, all };
};

export const parseCommandArgs = (
  input: string,
  delimiters: string[] = ["`"]
) => {
  const delimiterPattern = delimiters
    .map((d) => `\\${d}([^\\${d}]*)\\${d}`)
    .join("|");
  const regex = new RegExp(`${delimiterPattern}|[^\\s]+`, "g");
  const matches = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1] || match[0]);
  }
  return matches;
};
