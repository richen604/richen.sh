import React from 'react';
import { type CommandParams } from '..';
import { rm, updateFileSystemStore } from '../../utils/filesystem';

const Rm: React.FC<CommandParams> = ({ args, filesystem }) => {
  if (!args || args.length === 0) {
    return <div>Usage: rm &lt;file_or_directory&gt;</div>;
  }
  try {
    const newFs = rm(filesystem, args[0]);
    updateFileSystemStore(newFs);
    return <div>Removed: {args[0]}</div>;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Rm;