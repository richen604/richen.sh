import type React from "react";
import { useAtom } from "jotai";
import { type DisplayItem, displayAtom } from "../../store/terminalAtoms";
import commandRegistry, { type Commands } from "../../commands";
import { useState } from "react";
import { handleCommand, parseArgsAndFlags, parseCommandArgs } from "./utils";

const useCommands = () => {
  const [display] = useAtom(displayAtom);
  const commandHistory = display.map((item) => {
    // TODO: validate display items with zod
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

  return { handleKeyDown, commandRegistry };
};

export default useCommands;
