import React from 'react';
import { type CommandParams } from '..';
import { ls } from '../../utils/filesystem';

const Ls: React.FC<CommandParams> = ({ args, filesystem }) => {
  try {
    const files = ls(filesystem, args?.[0]);
    return (
      <pre className="whitespace-pre-wrap">
        {files}
      </pre>
    );
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Ls;