import React from 'react';
import { type CommandParams } from '..';
import { touch } from '../../utils/filesystem';

const Touch: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length === 0) {
      setResult(<div>Usage: touch &lt;file&gt;</div>);
      return;
    }

    try {
      touch(filesystem, args[0]);
      setResult(<div>File created: {args[0]}</div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Touch;