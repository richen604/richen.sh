import React from 'react';
import { type CommandParams } from '..';
import { mkdir } from '../../utils/filesystem';

const Mkdir: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length === 0) {
      setResult(<div><span className="text-accent">Usage: mkdir</span> <span className="text-secondary">&lt;directory&gt;</span></div>);
      return;
    }

    try {
      mkdir(filesystem, args[0]);
      setResult(<div><span className="text-accent">Directory created:</span> <span className="text-info">{args[0]}</span></div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Mkdir;
