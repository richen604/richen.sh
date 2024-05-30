/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useEffect, useRef } from "react";
import useCommands from "./_hooks/useCommands";
import useTerminalDisplay from "./_hooks/useTerminalDisplay";

export default function Home() {
  const { display, push } = useTerminalDisplay();
  const { handleKeyDown, commandRegistry } = useCommands();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main className="text-xl font-mono flex flex-col p-10 h-screen">
      <span className="comment">// this is a comment </span>
      <nav className="flex mb-4">
        <div className="flex space-x-4">
          <button className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]">
            projects
          </button>
          <button className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]">
            experience
          </button>
          <button
            onClick={() => (window.location.href = "mailto:richard@richen.dev")}
            className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
          >
            contact
          </button>
        </div>
        <div className="flex space-x-4 ml-auto">
          <button
            onClick={() => {
              commandRegistry.clear();
              push("help");
            }}
            className="text-center w-6 h-6 focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
          >
            ?
          </button>
          <button
            onClick={() => commandRegistry.clear()}
            className="text-center w-6 h-6 focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
            aria-label="Clear Display"
          >
            x
          </button>
        </div>
      </nav>
      <div>{display?.length > 0 ? display : null}</div>
      <div className="w-full h-10 p-2">
        <span>&gt;</span>

        <input
          ref={inputRef}
          className="bg-transparent outline-none ml-2 w-11/12"
          onKeyDown={handleKeyDown}
        />
      </div>
    </main>
  );
}
