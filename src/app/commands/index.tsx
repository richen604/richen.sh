import Echo from "./echo";
import Help from "./help";
import Neofetch from "./neofetch";
import Shader from "./shader";
import Clear from "./clear";
import Fs from "./fs";
import { type FileSystem } from '../utils/filesystem';

export type CommandParams = {
  args: string[];
  flags: Record<string, string[]>;
  all: string[];
  timestamp: string;
  filesystem: FileSystem;
};

export const componentMap = {
  echo: Echo,
  help: Help,
  neofetch: Neofetch,
  shader: Shader,
  clear: Clear,
  cat: Fs.cat,
  cd: Fs.cd,
  mkdir: Fs.mkdir,
  mv: Fs.mv,
  rm: Fs.rm,
  touch: Fs.touch,
  ls: Fs.ls,
  cp: Fs.cp,
  cwd: Fs.cwd,
};

export type Commands = keyof typeof componentMap;

export default componentMap;