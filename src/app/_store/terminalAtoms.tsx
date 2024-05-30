"use client";

import { atom, createStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Echo from "../_commands/echo";
import Help from "../_commands/help";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<string, React.FunctionComponent<any>> = {
  help: () => <Help />,
  echo: (props: React.PropsWithChildren<{ message: string }>) => (
    <Echo message={props.message} />
  ),
};
