"use client";
import type React from "react";
import { useAtom } from "jotai";
import { displayAtom } from "../_store/terminalAtoms";
import commandRegistry, { type Commands } from "../_commands";

const useCommands = () => {
  const [, setDisplay] = useAtom(displayAtom);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputElement = event.target as HTMLInputElement;
      const commandArgs = inputElement.value.trim().split(" ");
      const command = commandArgs[0];
      const { args, flags, all } = parseArgsAndFlags(commandArgs.slice(1));
      handleCommand(command as Commands, args, flags, all);
      inputElement.value = "";
    }
  };

  const parseArgsAndFlags = (args: string[]) => {
    const flags: Record<string, boolean> = {};
    const filteredArgs: string[] = [];
    const all: string[] = [];

    args.forEach((arg) => {
      if (arg.startsWith("-")) {
        flags[arg] = true;
      } else {
        filteredArgs.push(arg);
      }
      all.push(arg);
    });

    return { args: filteredArgs, flags, all };
  };

  const handleCommand = (
    command: Commands,
    args: string[],
    flags: Record<string, boolean>,
    all: string[]
  ) => {
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
        componentKey: "echo",
        props: { message: `Unknown command: ${command}` },
      }),
    ]);
  };

  return { handleKeyDown, commandRegistry };
};

export default useCommands;
