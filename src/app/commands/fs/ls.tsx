import React from 'react';
import { type CommandParams } from '..';
import { ls } from '../../utils/filesystem';

const Ls: React.FC<CommandParams> = ({ args, filesystem }) => {
  try {
    const files = ls(filesystem, args?.[0]);
    return (
      <pre className="whitespace-pre-wrap font-mono">
        {files.map(({ name, type, text }, index) => <React.Fragment key={name}>
          {index > 0 && '\n'}<span className={type === 'directory' ? 'text-info' : 'text-accent'}>{text}</span>
        </React.Fragment>)}
      </pre>
    );
  } catch (error) {
    return <div>{(error as Error).message}</div>;
  }
};

export default Ls;
