import type UAParser from "ua-parser-js";
import Echo, { handleEcho } from "./echo";
import Help, { handleHelp } from "./help";
import Neofetch, { handleNeofetch } from "./neofetch";
import Shader, { type ShaderProps } from "./shader";
import handleShader from "./shader/handle";
import handleClear from "./clear";

export type CommandParams = {
  args?: string[];
  flags?: Record<string, string[]>;
  all?: string[];
};

const commandRegistry = {
  echo: (params?: CommandParams) => handleEcho(params ?? {}),
  clear: (params?: CommandParams) => handleClear(params ?? {}),
  help: () => handleHelp(),
  neofetch: () => handleNeofetch(),
  shader: (params?: CommandParams) => handleShader(params ?? {}),
};

export type Commands = keyof typeof commandRegistry;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentMap: Record<string, React.FunctionComponent<any>> = {
  help: () => <Help />,
  echo: (props: React.PropsWithChildren<{ message: string }>) => (
    <Echo message={props.message} />
  ),
  neofetch: (props: React.PropsWithChildren<{ result: UAParser.IResult }>) => (
    <Neofetch result={props.result} />
  ),
  shader: (props: ShaderProps) => <Shader {...props} />,
};

export default commandRegistry;
