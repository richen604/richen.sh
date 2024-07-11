"use client";

import { atom, createStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import commandRegistry from "../_commands";
import { componentMap } from "../_commands";

export type DisplayItem = {
  componentKey: keyof typeof commandRegistry;
  props: Record<string, unknown>;
  time?: string;
};

export const store = createStore();

export const displayAtom = atomWithStorage<string[]>("terminal-display", [
  JSON.stringify({
    componentKey: "help",
    props: {},
  }),
]);

export const renderedDisplayAtom = atom((get) => {
  const display = get(displayAtom);
  return display.map((item, idx) => {
    const { componentKey, props, time } = JSON.parse(item) as DisplayItem;

    if (!componentMap[componentKey] && !commandRegistry[componentKey]) {
      const unknownMessage = `richen.sh: command not found: ${componentKey}`;
      return (
        <div key={idx}>
          <div className="flex w-full h-10 p-2 ">
            <span>&gt;</span>
            <input
              readOnly
              className="bg-transparent outline-none text-wrap ml-2 min-w-0 flex-grow text-sm md:text-base lg:text-lg"
              value={componentKey}
            />
            {time && (
              <span className="ml-2 text-nowrap text-xs md:text-sm lg:text-base">
                {new Date(time).toLocaleTimeString()}
              </span>
            )}
          </div>
          <componentMap.echo message={unknownMessage} />
        </div>
      );
    }
    const Component = componentMap[componentKey];

    return (
      <div key={idx}>
        <div className="flex w-full min-w-0 h-10 p-2">
          <span>&gt;</span>
          <input
            readOnly
            className="bg-transparent outline-none ml-2 text-wrap min-w-0 flex-grow text-sm md:text-base lg:text-lg"
            value={componentKey === "echo" ? "" : componentKey}
          />
          {time && (
            <span className="ml-2 text-nowrap text-xs md:text-sm lg:text-base">
              {new Date(time).toLocaleTimeString()}
            </span>
          )}
        </div>
        <Component {...props} />
      </div>
    );
  });
});
