import React from "react";
import { type CommandParams } from "..";
import useCommands from "@/app/hooks/useCommands";

const Clear: React.FC<CommandParams> = () => {
  const { clearDisplay } = useCommands();
  
  React.useEffect(() => {
    clearDisplay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Clear;
