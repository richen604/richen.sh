import React from 'react';
import { type CommandParams } from '..';
import { rm } from '../../utils/filesystem';

const Rm: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length === 0) {
      setResult(<div><span className="text-accent">Usage: rm</span> <span className="text-secondary">&lt;file_or_directory&gt;</span></div>);
      return;
    }

    try {
      rm(filesystem, args[0]);
      setResult(<div><span className="text-accent">Removed:</span> <span className="text-secondary">{args[0]}</span></div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Rm;
