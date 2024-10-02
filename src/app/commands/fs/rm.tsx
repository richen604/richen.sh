import React from 'react';
import { type CommandParams } from '..';
import { rm } from '../../utils/filesystem';

const Rm: React.FC<CommandParams> = ({ args, filesystem }) => {
  if (!args || args.length === 0) {
    return <div>Usage: rm &lt;file_or_directory&gt;</div>;
  }
  try {
    rm(filesystem, args[0]);
    return <div>Removed: {args[0]}</div>;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Rm;