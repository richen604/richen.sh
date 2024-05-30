"use client";

import React from "react";
export { default as handleHelp } from "./handle";

const Help = () => {
  return (
    <div>
      <p>Available commands:</p>
      <ul>
        <li>clear</li>
        <li>Help</li>
        <li>ls</li>
      </ul>
    </div>
  );
};

export default Help;
