import React from 'react';
import { type CommandParams } from '..';
import { touch, updateFileSystemStore } from '../../utils/filesystem';

const Touch: React.FC<CommandParams> = ({ args, filesystem }) => {
  if (!args || args.length === 0) {
    return <div>Usage: touch &lt;file&gt;</div>;
  }

  try {
    const newFs = touch(filesystem, args[0]);
    updateFileSystemStore(newFs);
    return <div>File created: {args[0]}</div>;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Touch;