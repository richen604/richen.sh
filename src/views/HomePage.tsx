import { useAtom } from "jotai";
import React from "react";

import { componentMap } from "../app/commands";
import TerminalLayout from "../app/components/TerminalLayout";
import { CommandEntry } from "../app/components/CommandEntry";
import useCommands from "../app/hooks/useCommands";
import { displayAtom, type DisplayItem as DisplayItemValue } from "../app/store";
import { SiteBanner } from "../blog/SiteBanner";
import eightg518k from "../../content/assets/art/homepage/8g518k.art.json?prepared";

const DisplayItem = React.memo(({ item }: { item: string }) => {
  let value: DisplayItemValue;
  try {
    value = JSON.parse(item) as DisplayItemValue;
  } catch {
    return <div className="display-item p-2 text-secondary">Unable to display saved terminal entry.</div>;
  }
  if (!value || typeof value !== "object" || typeof value.componentKey !== "string") {
    return <div className="display-item p-2 text-secondary">Unable to display saved terminal entry.</div>;
  }
  const { componentKey, props, timestamp } = value;
  const Component = Object.hasOwn(componentMap, componentKey)
    ? (componentMap as Partial<Record<string, React.ComponentType<DisplayItemValue["props"]>>>)[componentKey]
    : undefined;
  // Unknown commands are saved as text descriptors, not registered components.
  const unknownCommand = componentKey.endsWith(": command not found");
  const safeTimestamp = typeof timestamp === "string" && !Number.isNaN(Date.parse(timestamp))
    ? timestamp
    : new Date(0).toISOString();
  const safeProps = props && typeof props === "object" && !Array.isArray(props) ? props : undefined;

  return (
    <CommandEntry command={componentKey} timestamp={safeTimestamp} args={Array.isArray(safeProps?.args) ? safeProps.args.filter((arg): arg is string => typeof arg === "string") : []}>
      {unknownCommand && safeProps ? null : Component && safeProps ? <Component {...safeProps} timestamp={safeTimestamp} key={`${componentKey}-${safeTimestamp}`} /> : (
        <div className="p-2 text-secondary">Unable to display saved terminal entry.</div>
      )}
    </CommandEntry>
  );
});

DisplayItem.displayName = "DisplayItem";

export default function HomePage({ limit, start = 0, compareArt = false }: { limit?: number; start?: number; compareArt?: boolean }) {
  const [display] = useAtom(displayAtom);
  const { handleKeyDown } = useCommands();

  return (
    <TerminalLayout showCLI startAtTop={compareArt} onKeyDown={handleKeyDown} outputKey={`${start}:${limit ?? ""}`}>
      {compareArt && <SiteBanner artifact={eightg518k} />}
      {display.slice(start, limit).map((item, index) => (
        <DisplayItem key={start + index} item={item} />
      ))}
    </TerminalLayout>
  );
}
