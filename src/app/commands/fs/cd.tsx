import React from 'react';
import { type CommandParams } from '..';
import { cd } from '../../utils/filesystem';

const Cd: React.FC<CommandParams> = ({ args, filesystem }) => {
  if (!args || args.length === 0) {
    return <div>Usage: cd &lt;directory&gt;</div>;
  }

  try {
    cd(filesystem, args[0]);
    return null;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Cd;