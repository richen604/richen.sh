"use client";

import React from "react";
import TerminalLayout from "../components/TerminalLayout";
import Contact from "../commands/contact";
import { useAtom } from "jotai";
import { fileSystemAtom } from "../utils/filesystem";

export default function ContactPage() {
  const [filesystem] = useAtom(fileSystemAtom);

  // Create mock command params for the static page
  const commandParams = {
    args: [],
    flags: {},
    all: [],
    timestamp: new Date().toISOString(),
    filesystem,
  };

  return (
    <TerminalLayout showCLI={false}>
      <div className="display-item">
        <div className="p-2 flex justify-between items-center">
          <span>&gt; contact</span>
          <span className="text-nowrap ml-2 text-gray-500 text-xs md:text-sm lg:text-base">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <Contact {...commandParams} />
      </div>
    </TerminalLayout>
  );
} 