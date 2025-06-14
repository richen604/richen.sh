import React from "react";
import { type CommandParams } from "..";

const Projects: React.FC<CommandParams> = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="border-l-2 border-gray-500 pl-4">
          <h3 className="font-semibold text-green-400">richen.sh</h3>
          <p className="text-gray-300 text-sm">Interactive terminal portfolio website</p>
          <p className="text-gray-400 text-xs mt-1">Next.js, TypeScript, Tailwind CSS</p>
        </div>

        <div className="border-l-2 border-gray-500 pl-4">
          <h3 className="font-semibold text-blue-400">Project Alpha</h3>
          <p className="text-gray-300 text-sm">Full-stack web application with modern architecture</p>
          <p className="text-gray-400 text-xs mt-1">React, Node.js, PostgreSQL</p>
        </div>

        <div className="border-l-2 border-gray-500 pl-4">
          <h3 className="font-semibold text-purple-400">CLI Tools Suite</h3>
          <p className="text-gray-300 text-sm">Collection of productivity command-line tools</p>
          <p className="text-gray-400 text-xs mt-1">Rust, Python</p>
        </div>
      </div>
      <div className="mt-6 text-sm text-gray-400">
        <p>For more details, visit my GitHub or contact me directly.</p>
      </div>
    </div>
  );
};

export default Projects; 