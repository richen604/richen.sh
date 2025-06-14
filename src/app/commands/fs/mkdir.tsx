import React from 'react';
import { type CommandParams } from '..';
import { mkdir } from '../../utils/filesystem';

const Mkdir: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length === 0) {
      setResult(<div>Usage: mkdir &lt;directory&gt;</div>);
      return;
    }

    try {
      mkdir(filesystem, args[0]);
      setResult(<div>Directory created: {args[0]}</div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Mkdir;