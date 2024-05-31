"use client";
import type React from "react";
import { useAtom } from "jotai";
import { type DisplayItem, displayAtom } from "../_store/terminalAtoms";
import commandRegistry, { type Commands } from "../_commands";
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
      const commandArgs = inputElement.value.trim().split(" ");
      const command = commandArgs[0];
      const { args, flags, all } = parseArgsAndFlags(commandArgs.slice(1));
      handleCommand(command as Commands, args, flags, all);
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
        componentKey: command,
        props: { message: `richen.sh: command not found: ${command}` },
        time: new Date().toISOString(),
      }),
    ]);
  };

  return { handleKeyDown, commandRegistry };
};

export default useCommands;
