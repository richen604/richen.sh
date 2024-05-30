import handleClear from "./clear";
import Echo, { handleEcho } from "./echo";
import Help, { handleHelp } from "./help";
import Neofetch, { handleNeofetch } from "./neofetch";
import type { BrowserInfo } from "./neofetch/handle";

export type CommandParams = {
  args?: string[];
  flags?: Record<string, boolean>;
  all?: string[];
};

const commandRegistry = {
  echo: (params?: CommandParams) => handleEcho(params ?? {}),
  clear: (params?: CommandParams) => handleClear(params ?? {}),
  help: () => handleHelp(),
  neofetch: () => handleNeofetch(),
};

export type Commands = keyof typeof commandRegistry;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentMap: Record<string, React.FunctionComponent<any>> = {
  help: () => <Help />,
  echo: (props: React.PropsWithChildren<{ message: string }>) => (
    <Echo message={props.message} />
  ),
  neofetch: (props: React.PropsWithChildren<{ browserInfo: BrowserInfo }>) => (
    <Neofetch browserInfo={props.browserInfo} />
  ),
};

export default commandRegistry;
