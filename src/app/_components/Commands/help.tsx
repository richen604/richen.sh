"use client";

import React from "react";

type Props = {};

const Help = (props: Props) => {
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
