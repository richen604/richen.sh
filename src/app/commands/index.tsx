import Echo from "./echo";
import Help from "./help";
import Neofetch from "./neofetch";
import Shader from "./shader";
import Clear from "./clear";

export type CommandParams = {
  args?: string[];
  flags?: Record<string, string[]>;
  all?: string[];
};

export const componentMap = {
  echo: Echo,
  help: Help,
  neofetch: Neofetch,
  shader: Shader,
  clear: Clear,
};

export type Commands = keyof typeof componentMap;

const commandRegistry = {
  echo: Echo,
  clear: Clear,
  help: Help,
  neofetch: Neofetch,
  shader: Shader,
};

export default commandRegistry;