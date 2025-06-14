"use client";

import React from "react";
import TerminalLayout from "../components/TerminalLayout";
import Projects from "../commands/projects";
import { useAtom } from "jotai";
import { fileSystemAtom } from "../utils/filesystem";

export default function ProjectsPage() {
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
          <span>&gt; projects</span>
          <span className="text-nowrap ml-2 text-gray-500 text-xs md:text-sm lg:text-base">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <Projects {...commandParams} />
      </div>
    </TerminalLayout>
  );
} 