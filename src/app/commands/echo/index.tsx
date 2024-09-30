import React from "react";
import { type CommandParams } from "..";

const Echo: React.FC<CommandParams> = ({ all }) => {
  const message = all?.join(" ") ?? "";
  return <div>{message}</div>;
};

export default Echo;