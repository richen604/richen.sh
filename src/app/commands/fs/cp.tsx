import React from 'react';
import { type CommandParams } from '..';
import { cp } from '../../utils/filesystem';

const Cp: React.FC<CommandParams> = ({ args, filesystem }) => {
  if (!args || args.length < 2) {
    return <div>Usage: cp &lt;source&gt; &lt;destination&gt;</div>;
  }

  try {
    cp(filesystem, args[0], args[1]);
    return <div>Copied {args[0]} to {args[1]}</div>;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Cp;
