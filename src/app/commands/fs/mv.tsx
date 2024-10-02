import React from 'react';
import { type CommandParams } from '..';
import { mv } from '../../utils/filesystem';

const Mv: React.FC<CommandParams> = ({ args, filesystem }) => {
  if (!args || args.length < 2) {
    return <div>Usage: mv &lt;source&gt; &lt;destination&gt;</div>;
  }

  try {
    mv(filesystem, args[0], args[1]);
    return <div>Moved {args[0]} to {args[1]}</div>;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Mv;