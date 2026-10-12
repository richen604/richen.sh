import React from "react";
import { type CommandParams } from "..";

const Projects: React.FC<CommandParams> = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-normal">
            <a href="https://github.com/richen604/richendots">richendots</a>
          </h3>
          <p className="text-secondary">Personal multi-host <span className="text-secondary-accent">NixOS</span> configuration</p>
        </div>

        <div>
          <h3 className="font-normal">
            <a href="https://github.com/richen604/godot-shell">godot-shell</a>
          </h3>
          <p className="text-secondary">Reproducible <span className="text-secondary-accent">Godot</span> development template</p>
        </div>

        <div>
          <h3 className="font-normal">
            <a href="https://github.com/richen604/hydenix">hydenix</a>{" "}
            <span className="text-xs text-secondary-accent">[archived]</span>
          </h3>
          <p className="text-secondary">Declarative <span className="text-secondary-accent">NixOS</span> configuration for <span className="text-secondary-accent">HyDE</span></p>
        </div>

        <div>
          <h3 className="font-normal">
            <a href="https://github.com/richen604/richen.sh">richen.sh</a>
          </h3>
          <p className="text-secondary">Interactive terminal website</p>
        </div>
      </div>
    </div>
  );
};

export default Projects;
