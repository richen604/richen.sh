/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { displayAtom, renderedDisplayAtom } from "./_store/terminalAtoms";
import useCommands from "./_hooks/useCommands";
import useTerminalDisplay from "./_hooks/useTerminalDisplay";

export default function Home() {
  const { display, push, clear } = useTerminalDisplay();
  const { handleKeyDown } = useCommands();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main className="text-xl font-mono flex flex-col p-10 h-screen">
      <span className="comment">// this is a comment </span>
      <nav className="flex space-x-4 mb-4">
        <a
          onClick={() => push("help")}
          className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
        >
          home
        </a>
        <a href="#about" className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]">
          about
        </a>
        <a
          href="#services"
          className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
        >
          services
        </a>
        <a
          href="#contact"
          className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
        >
          contact
        </a>
        <button
          onClick={clear}
          className="self-end focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
          aria-label="Clear Display"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
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
