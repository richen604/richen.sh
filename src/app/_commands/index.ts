import handleClear from "./clear";
import handleEcho from "./echo/handle";
import handleHelp from "./help/handle";
import handleNeofetch from "./neofetch/handle";

export type CommandParams = {
  args?: string[];
  flags?: Record<string, boolean>;
  all?: string[];
};

const commandRegistry: Record<string, (params?: CommandParams) => void> = {
  echo: (params) => handleEcho(params ?? {}),
  clear: (params) => handleClear(params ?? {}),
  help: () => handleHelp(),
  neofetch: () => handleNeofetch(),
};

export default commandRegistry;
