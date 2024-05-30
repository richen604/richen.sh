"use client";

import { atom, createStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { componentMap } from "../_commands";

export const store = createStore();

export const displayAtom = atomWithStorage<string[]>("terminal-display", [
  JSON.stringify({ componentKey: "help", props: {} }),
]);

export const renderedDisplayAtom = atom((get) => {
  const display = get(displayAtom);
  return display.map((item, idx) => {
    const { componentKey, props } = JSON.parse(item) as {
      componentKey: string;
      props: Record<string, unknown>;
    };
    const Component = componentMap[componentKey];
    return <Component key={idx} {...props} />;
  });
});
