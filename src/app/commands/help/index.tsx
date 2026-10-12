import React from "react";
import { type CommandParams } from "..";

const Help: React.FC<CommandParams> = () => {
  return (
    <div className="">
      <p className="text-accent">Available commands:</p>
      <ul>
        <li><span className="text-accent">clear</span> - Clear the terminal screen</li>
        <li><span className="text-accent">echo</span> <span className="text-secondary-accent">[text]</span> - Display a line of text</li>
        <li><span className="text-accent">help</span> - Display this help message</li>
        <li><span className="text-accent">neofetch</span> - Display system information</li>
        <li><span className="text-accent">shader</span> <span className="text-secondary-accent">[?example]</span> - Run a shader example</li>
        <li><span className="text-accent">projects</span> - Display my projects</li>
        <li><span className="text-accent">contact</span> - Display contact information</li>
        <li><span className="text-accent">blog</span> <span className="text-secondary-accent">[post]</span> - List posts or read a post</li>
        <li><span className="text-accent">history</span> - Display command history</li>
        <li><span className="text-accent">cat</span> <span className="text-secondary-accent">[file]</span> - Display the contents of a file</li>
        <li><span className="text-accent">cd</span> <span className="text-secondary-accent">[directory]</span> - Change directory; <span className="text-accent">cd</span> or <span className="text-accent">cd</span> <span className="text-secondary-accent">~</span> returns to <span className="text-info">/home/richen</span></li>
        <li><span className="text-accent">pwd</span> (or <span className="text-accent">cwd</span>) - Display the current directory</li>
        <li><span className="text-accent">mkdir</span> <span className="text-secondary-accent">[directory]</span> - Create a new directory</li>
        <li><span className="text-accent">mv</span> <span className="text-secondary-accent">[source] [destination]</span> - Move a file or directory</li>
        <li><span className="text-accent">rm</span> <span className="text-secondary-accent">[file/directory]</span> - Remove a file or directory</li>
        <li><span className="text-accent">touch</span> <span className="text-secondary-accent">[file]</span> - Create a new file</li>
        <li><span className="text-accent">ls</span> <span className="text-secondary-accent">[directory]</span> - List directory contents</li>
        <li><span className="text-accent">cp</span> <span className="text-secondary-accent">[source] [destination]</span> - Copy a file or directory</li>
      </ul>
      <p>For more information on a specific command, type &quot;<span className="text-accent">[command]</span> <span className="text-secondary-accent">--help</span>&quot;</p>
    </div>
  );
};

export default Help;
