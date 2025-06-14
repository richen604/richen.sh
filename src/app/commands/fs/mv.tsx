import React from 'react';
import { type CommandParams } from '..';
import { mv } from '../../utils/filesystem';

const Mv: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length < 2) {
      setResult(<div>Usage: mv &lt;source&gt; &lt;destination&gt;</div>);
      return;
    }

    try {
      mv(filesystem, args[0], args[1]);
      setResult(<div>Moved {args[0]} to {args[1]}</div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Mv;