import React from "react";
import { type CommandParams } from "..";

const Projects: React.FC<CommandParams> = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="border-l-2 border-gray-500 pl-4">
          <h3 className="font-semibold">
            <a href="https://github.com/richen604/richendots">richendots</a>
          </h3>
          <p className="text-gray-300 text-sm">Personal multi-host NixOS configuration</p>
        </div>

        <div className="border-l-2 border-gray-500 pl-4">
          <h3 className="font-semibold">
            <a href="https://github.com/richen604/godot-shell">godot-shell</a>
          </h3>
          <p className="text-gray-300 text-sm">Reproducible Godot development template</p>
        </div>

        <div className="border-l-2 border-gray-500 pl-4">
          <h3 className="font-semibold">
            <a href="https://github.com/richen604/hydenix">hydenix</a>{" "}
            <span className="text-xs text-gray-400">[archived]</span>
          </h3>
          <p className="text-gray-300 text-sm">Declarative NixOS configuration for HyDE</p>
        </div>

        <div className="border-l-2 border-gray-500 pl-4">
          <h3 className="font-semibold">
            <a href="https://github.com/richen604/richen.sh">richen.sh</a>
          </h3>
          <p className="text-gray-300 text-sm">Interactive terminal website</p>
        </div>
      </div>
      <div className="mt-6 text-sm text-gray-400">
        <p>For more details, visit my GitHub or contact me directly.</p>
      </div>
    </div>
  );
};

export default Projects;
