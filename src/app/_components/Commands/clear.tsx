/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import useTerminalDisplay from "@/app/_hooks/useTerminalDisplay";

const Clear = () => {
  const { clear } = useTerminalDisplay();

  return clear();
};

export default Clear;
