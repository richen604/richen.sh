import { useAtom } from "jotai";
import React from "react";

import { componentMap } from "../app/commands";
import TerminalLayout from "../app/components/TerminalLayout";
import useCommands from "../app/hooks/useCommands";
import { displayAtom, type DisplayItem as DisplayItemValue } from "../app/store";

const DisplayItem = React.memo(({ item }: { item: string }) => {
  let value: DisplayItemValue;
  try {
    value = JSON.parse(item) as DisplayItemValue;
  } catch {
    return <div className="display-item p-2 text-gray-500">Unable to display saved terminal entry.</div>;
  }
  const { componentKey, props, timestamp } = value;
  const Component = (componentMap as Partial<Record<string, React.ComponentType<DisplayItemValue["props"]>>>)[componentKey];
  const safeTimestamp = typeof timestamp === "string" && !Number.isNaN(Date.parse(timestamp))
    ? timestamp
    : new Date(0).toISOString();
  const safeProps = props && typeof props === "object" ? props : undefined;

  return (
    <div className="display-item" data-key={`${componentKey}-${timestamp}`}>
      <div className="p-2 flex justify-between items-center">
        <span>{`> ${componentKey}${Array.isArray(safeProps?.args) ? ` ${safeProps.args.filter((arg): arg is string => typeof arg === "string").join(" ")}` : ""}`}</span>
        <span className="text-nowrap ml-2 text-gray-500 text-xs md:text-sm lg:text-base">
          {new Date(safeTimestamp).toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
      {Component && safeProps ? <Component {...safeProps} key={`${componentKey}-${safeTimestamp}`} /> : (
        <div className="p-2 text-gray-500">Unable to display saved terminal entry.</div>
      )}
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
