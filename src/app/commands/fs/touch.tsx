import React from 'react';
import { type CommandParams } from '..';
import { touch } from '../../utils/filesystem';

const Touch: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length === 0) {
      setResult(<div><span className="text-accent">Usage: touch</span> <span className="text-secondary">&lt;file&gt;</span></div>);
      return;
    }

    try {
      touch(filesystem, args[0]);
      setResult(<div><span className="text-accent">File created:</span> <span className="text-accent">{args[0]}</span></div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Touch;
