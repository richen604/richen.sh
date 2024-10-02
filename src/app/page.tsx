/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import { useEffect, useRef } from "react";
import useCommands from "./hooks/useCommands";
import { useAtom } from "jotai";
import { displayAtom, type DisplayItem, store } from "./store";
import { type Commands, componentMap } from "./commands";
import React from "react";
import { fileSystemAtom } from "./utils/filesystem";

const DisplayItem = React.memo(({ item }: { item: string }) => {
  const { componentKey, props, timestamp } = JSON.parse(item) as DisplayItem;
  const Component = componentMap[componentKey as Commands];

  return  (
    <div className="display-item" data-key={`${componentKey}-${timestamp}`}>
      <div className="p-2 flex justify-between items-center">
        <span>{`> ${componentKey}${props.args ? ' ' + props.args.join(' ') : ''}`}</span>
        <span className="text-nowrap ml-2 text-gray-500 text-xs md:text-sm lg:text-base">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
      {Component && <Component {...props} key={`${componentKey}-${timestamp}`}/>}
    </div>
  );
});

DisplayItem.displayName = 'DisplayItem';

export default function Home() {
  const [display] = useAtom(displayAtom);
  const { handleKeyDown } = useCommands();
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  
  const [filesystem] = useAtom(fileSystemAtom);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  }, [display]);

  return (
    <main ref={mainRef} className="h-screen flex flex-col overflow-hidden text-sm md:text-base lg:text-lg font-mono p-10">
      <span className="comment">// this is a comment </span>
      <nav className="flex mb-4 flex-shrink-0">
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
                  timestamp: new Date().toISOString(),
                }),
              ]);
            }}
            className="text-center w-6 h-6 focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
          >
            ?
          </button>
          <button
            onClick={() => {
              store.set(displayAtom, []);
            }}
            className="text-center w-6 h-6 focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
            aria-label="Clear Display"
          >
            x
          </button>
        </div>
      </nav>
      <div ref={displayRef} className="overflow-y-auto">
        {display.map((item, index) => (
          <DisplayItem key={index} item={item} />
        ))}
      </div>
      <div className="flex w-full min-w-0 h-10 p-2 text-sm md:text-base lg:text-lg flex-shrink-0">
        <span>{filesystem.cwd.join('/')} &gt;</span>
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
