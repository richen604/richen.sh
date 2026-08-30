import { useAtom } from "jotai";
import React from "react";

import { type Commands, componentMap } from "../app/commands";
import TerminalLayout from "../app/components/TerminalLayout";
import useCommands from "../app/hooks/useCommands";
import { displayAtom, type DisplayItem as DisplayItemValue } from "../app/store";

const DisplayItem = React.memo(({ item }: { item: string }) => {
  const { componentKey, props, timestamp } = JSON.parse(item) as DisplayItemValue;
  const Component = componentMap[componentKey as Commands];

  return (
    <div className="display-item" data-key={`${componentKey}-${timestamp}`}>
      <div className="p-2 flex justify-between items-center">
        <span>{`> ${componentKey}${props?.args ? ` ${props.args.join(" ")}` : ""}`}</span>
        <span className="text-nowrap ml-2 text-gray-500 text-xs md:text-sm lg:text-base">
          {new Date(timestamp).toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
      {Component && <Component {...props} key={`${componentKey}-${timestamp}`} />}
    </div>
  );
});

DisplayItem.displayName = "DisplayItem";

export default function HomePage() {
  const [display] = useAtom(displayAtom);
  const { handleKeyDown } = useCommands();

  return (
    <TerminalLayout showCLI onKeyDown={handleKeyDown}>
      {display.map((item, index) => (
        <DisplayItem key={index} item={item} />
      ))}
    </TerminalLayout>
  );
}
