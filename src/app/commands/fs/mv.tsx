import React from 'react';
import { type CommandParams } from '..';
import { mv } from '../../utils/filesystem';

const Mv: React.FC<CommandParams> = ({ args, filesystem }) => {
  const [result, setResult] = React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    if (!args || args.length < 2) {
      setResult(<div><span className="text-accent">Usage: mv</span> <span className="text-secondary">&lt;source&gt; &lt;destination&gt;</span></div>);
      return;
    }

    try {
      mv(filesystem, args[0], args[1]);
      setResult(<div><span className="text-accent">Moved</span> <span className="text-secondary">{args[0]}</span> to <span className="text-secondary">{args[1]}</span></div>);
    } catch (error) {
      setResult(<div>{(error as Error).message}</div>);
    }
  }, [args, filesystem]);

  return result;
};

export default Mv;
