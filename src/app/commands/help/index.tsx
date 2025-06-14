import React from "react";
import { type CommandParams } from "..";

const Help: React.FC<CommandParams> = () => {
  return (
    <div className="leading-tight">
      <p>Available commands:</p>
      <ul>
        <li>clear - Clear the terminal screen</li>
        <li>echo [text] - Display a line of text</li>
        <li>help - Display this help message</li>
        <li>neofetch - Display system information</li>
        <li>shader [mode] [example] - Run a shader example</li>
        <li>projects - Display my projects</li>
        <li>contact - Display contact information</li>
        <li>cat [file] - Display the contents of a file</li>
        <li>cd [directory] - Change the current directory</li>
        <li>mkdir [directory] - Create a new directory</li>
        <li>mv [source] [destination] - Move a file or directory</li>
        <li>rm [file/directory] - Remove a file or directory</li>
        <li>touch [file] - Create a new file</li>
        <li>ls [directory] - List directory contents</li>
        <li>cp [source] [destination] - Copy a file or directory</li>
      </ul>
      <p>For more information on a specific command, type &quot;[command] --help&quot;</p>
    </div>
  );
};

export default Help;