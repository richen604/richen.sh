import React from 'react';
import { formatCwd } from '../../utils/identity';
import { type CommandParams } from '..';

const Cwd: React.FC<CommandParams> = ({ filesystem }) => {
  return <div><span className="text-accent">Current working directory:</span> <span className="text-info">{formatCwd(filesystem.cwd)}</span></div>;
};

export default Cwd;
