import React from 'react';
import { type CommandParams } from '..';
import { rm } from '../../utils/filesystem';

const Rm: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length === 0) {
      setResult(<div>Usage: rm &lt;file_or_directory&gt;</div>);
      return;
    }

    try {
      rm(filesystem, args[0]);
      setResult(<div>Removed: {args[0]}</div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Rm;