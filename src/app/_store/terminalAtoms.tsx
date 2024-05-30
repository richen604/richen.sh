"use client";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Echo from "../_components/Commands/echo";
import Help from "../_components/Commands/help";

export const displayAtom = atomWithStorage<string[]>("terminal-display", [
  JSON.stringify({ componentKey: "help", props: {} }),
]);
export const renderedDisplayAtom = atom((get) => {
  const display = get(displayAtom);
  return display.map((item, idx) => {
    const { componentKey, props } = JSON.parse(item);
    const Component = componentMap[componentKey];
    return <Component key={idx} {...props} />;
  });
});

const componentMap: { [key: string]: (props?: any) => JSX.Element } = {
  help: () => <Help />,
  echo: (props) => <Echo message={props.message} />,
};
