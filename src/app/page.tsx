/* eslint-disable react/jsx-no-comment-textnodes */
"use client";

import React from "react";
import useCommands from "./hooks/useCommands";
import { useAtom } from "jotai";
import { displayAtom, type DisplayItem } from "./store";
import { type Commands, componentMap } from "./commands";
import TerminalLayout from "./components/TerminalLayout";

const DisplayItem = React.memo(({ item }: { item: string }) => {
  const { componentKey, props, timestamp } = JSON.parse(item) as DisplayItem;
  const Component = componentMap[componentKey as Commands];

  return (
    <div className="display-item" data-key={`${componentKey}-${timestamp}`}>
      <div className="p-2 flex justify-between items-center">
        <span>{`> ${componentKey}${props?.args ? ' ' + props.args.join(' ') : ''}`}</span>
        <span className="text-nowrap ml-2 text-gray-500 text-xs md:text-sm lg:text-base">
          {new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      </div>
      {Component && <Component {...props} key={`${componentKey}-${timestamp}`} />}
    </div>
  );
});

DisplayItem.displayName = 'DisplayItem';

export default function Home() {
  const [display] = useAtom(displayAtom);
  const { handleKeyDown } = useCommands();

  return (
    <TerminalLayout showCLI={true} onKeyDown={handleKeyDown}>
      {display.map((item, index) => (
        <DisplayItem key={index} item={item} />
      ))}
    </TerminalLayout>
  );
}
