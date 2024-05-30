"use client";
import React from "react";
import { useAtom } from "jotai";
import { displayAtom, renderedDisplayAtom } from "../_store/terminalAtoms";

const useCommands = () => {
  const [, setDisplay] = useAtom(displayAtom);
  const [, setRenderedDisplay] = useAtom(renderedDisplayAtom);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputElement = event.target as HTMLInputElement;
      const commandArgs = inputElement.value.trim().split(" ");
      const command = commandArgs[0];
      const args = commandArgs.slice(1);
      handleCommand(command, args);
      inputElement.value = "";
    }
  };

  const handleCommand = (command: string, args: string[]) => {
    switch (command) {
      case "cat":
        handleCat(args);
        break;
      case "ls":
        handleLs(args);
        break;
      case "echo":
        handleEcho(args);
        break;
      case "clear":
        handleClear(args);
        break;
      case "help":
        handleHelp(args);
        break;
      default:
        console.log(`Unknown command: ${command}`);
    }
  };

  const handleCat = (args: string[]) => {
    console.log(`cat command with args: ${args.join(" ")}`);
    // Implement cat command logic here
  };

  const handleLs = (args: string[]) => {
    console.log(`ls command with args: ${args.join(" ")}`);
    // Implement ls command logic here
  };

  const handleEcho = (args: string[]) => {
    const message = args.join(" ");
    console.log(message);
    setDisplay((prev) => [
      ...prev,
      JSON.stringify({ componentKey: "echo", props: { message } }),
    ]);
  };

  const handleClear = (args: string[]) => {
    console.log(`clear command with args: ${args.join(" ")}`);
    // Implement clear command logic here
    setDisplay([]);
  };

  const handleHelp = (args: string[]) => {
    console.log(`help command with args: ${args.join(" ")}`);
    setDisplay((prev) => [...prev, JSON.stringify({ componentKey: "help" })]);
  };

  return { handleKeyDown };
};

export default useCommands;
