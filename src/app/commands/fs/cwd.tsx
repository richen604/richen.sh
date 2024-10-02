import React from 'react';
import { type CommandParams } from '..';

const Cwd: React.FC<CommandParams> = ({ filesystem }) => {
  return <div>Current working directory: {filesystem.cwd.join('/')}</div>;
};

export default Cwd;