import React from "react";
export { default as handleHelp } from "./handle";

const Help = () => {
  return (
    <div>
      <p>Available commands:</p>
      <ul>
        <li>clear</li>
        <li>echo</li>
        <li>help</li>
        <li>neofetch</li>
      </ul>
    </div>
  );
};

export default Help;
