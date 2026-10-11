import React from 'react';
import { type CommandParams } from '..';
import { cd } from '../../utils/filesystem';

const Cd: React.FC<CommandParams> = ({ args, filesystem }) => {
  try {
    cd(filesystem, args?.[0]);
    return null;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Cd;
