import React from 'react';
import { type CommandParams } from '..';
import { cp } from '../../utils/filesystem';

const Cp: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length < 2) {
      setResult(<div>Usage: cp &lt;source&gt; &lt;destination&gt;</div>);
      return;
    }

    try {
      cp(filesystem, args[0], args[1]);
      setResult(<div>Copied {args[0]} to {args[1]}</div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Cp;
