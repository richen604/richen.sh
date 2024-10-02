import React from 'react';
import { type CommandParams } from '..';
import { cat } from '../../utils/filesystem';

const Cat: React.FC<CommandParams> = ({ args, filesystem }) => {
  if (!args || args.length === 0) {
    return <div>Usage: cat &lt;file&gt;</div>;
  }

  try {
    const content = cat(filesystem, args[0]);
    return <div>{content}</div>;
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Cat;