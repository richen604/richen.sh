import React from "react";
import { type CommandParams } from "..";

const Contact: React.FC<CommandParams> = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-300 mb-4">Get in touch with me:</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <span className=" font-mono">email:</span>
          <a
            href="mailto:richardhenninger@live.com"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            richardhenninger@live.com
          </a>
        </div>

        <div className="flex items-center space-x-3">
          <span className=" font-mono">github:</span>
          <a
            href="https://github.com/richen604"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            github.com/richen604
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact; 