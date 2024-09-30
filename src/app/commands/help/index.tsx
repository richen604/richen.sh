import React from "react";
import { type CommandParams } from "..";

const Help: React.FC<CommandParams> = () => {
  return (
    <div>
      <p>Available commands:</p>
      <ul>
        <li>clear</li>
        <li>echo</li>
        <li>help</li>
        <li>neofetch</li>
        <li>shader</li>
      </ul>
    </div>
  );
};

export default Help;