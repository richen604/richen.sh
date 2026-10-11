import React from 'react';
import { formatCwd } from '../../utils/identity';
import { type CommandParams } from '..';

const Cwd: React.FC<CommandParams> = ({ filesystem }) => {
  return <div>Current working directory: {formatCwd(filesystem.cwd)}</div>;
};

export default Cwd;
