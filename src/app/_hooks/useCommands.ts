import type React from "react";
import { useAtom } from "jotai";
import { type DisplayItem, displayAtom } from "../_store/terminalAtoms";
import commandRegistry, {
  type CommandParams,
  type Commands,
} from "../_commands";
import { useState } from "react";

const useCommands = () => {
  const [display, setDisplay] = useAtom(displayAtom);
  const commandHistory = display.map((item) => {
    const parsedItem = JSON.parse(item) as DisplayItem;
    return parsedItem.componentKey;
  });
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const inputElement = event.target as HTMLInputElement;

    if (event.key === "Enter") {
      inputElement.scrollIntoView();
      inputElement.focus();
      const commandArgs = parseCommandArgs(inputElement.value.trim());
      const command = commandArgs[0] as Commands;
      const { args, flags, all } = parseArgsAndFlags(commandArgs.slice(1));
      handleCommand({ command, args, flags, all });
      setHistoryIndex(-1);
      inputElement.value = "";
    } else if (event.key === "ArrowUp") {
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex < 0
            ? commandHistory.length - 1
            : Math.max(historyIndex - 1, 0);
        setHistoryIndex(newIndex);
        inputElement.value = commandHistory[newIndex];
      }
    }
  };

  const parseCommandArgs = (input: string, delimiters: string[] = ["`"]) => {
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

  const parseArgsAndFlags = (args: string[]) => {
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

  const handleCommand = ({
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

  const handleUnknown = (command: string) => {
    setDisplay((prev) => [
      ...prev,
      JSON.stringify({
        componentKey: command,
        props: { message: `richen.sh: command not found: ${command}` },
        time: new Date().toISOString(),
      }),
    ]);
  };

  return { handleKeyDown, commandRegistry };
};

export default useCommands;
