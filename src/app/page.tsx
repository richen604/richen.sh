/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useEffect, useRef } from "react";
import useCommands from "./hooks/useCommands";
import { useAtom } from "jotai";
import { displayAtom, renderedDisplayAtom, store } from "./store/terminalAtoms";

export default function Home() {
  const [renderedDisplay] = useAtom(renderedDisplayAtom);
  const { handleKeyDown } = useCommands();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100); // Delay to ensure DOM is fully loaded
  }, []);

  return (
    <main className="h-full text-sm md:text-base lg:text-lg font-mono flex flex-col p-10 mb-5 overflow-y-scroll">
      <span className="comment">// this is a comment </span>
      <nav className="flex mb-4">
        <div className="flex space-x-4 ">
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
              store.set(displayAtom, [
                JSON.stringify({
                  componentKey: "help",
                }),
              ]);
            }}
            className="text-center w-6 h-6 focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
          >
            ?
          </button>
          <button
            onClick={() => store.set(displayAtom, [])}
            className="text-center w-6 h-6 focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
            aria-label="Clear Display"
          >
            x
          </button>
        </div>
      </nav>
      <div>{renderedDisplay?.length > 0 ? renderedDisplay : null}</div>
      <div className="flex w-full min-w-0 h-10 p-2 text-sm md:text-base lg:text-lg">
        <span>&gt;</span>
        <input
          ref={inputRef}
          className="bg-transparent outline-none ml-2 min-w-0 flex-grow"
          onKeyDown={handleKeyDown}
        />
        <span className="text-nowrap ml-2 text-xs md:text-sm lg:text-base">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </main>
  );
}
