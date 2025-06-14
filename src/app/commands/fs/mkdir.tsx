import React from 'react';
import { type CommandParams } from '..';
import { mkdir, updateFileSystemStore } from '../../utils/filesystem';

const Mkdir: React.FC<CommandParams> = ({ args, filesystem }) => {
  if (!args || args.length === 0) {
    return <div>Usage: mkdir &lt;directory&gt;</div>;
  }

  try {
    const newFs = mkdir(filesystem, args[0]);
    updateFileSystemStore(newFs);
    return <div>Directory created: {args[0]}</div>;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Mkdir;