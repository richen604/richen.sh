import { useAtom } from 'jotai';
import {  inputAtom, historyAtom, historyIndexAtom, displayAtom } from '../../store/';
import { parseArgsAndFlags, handleCommand } from './utils';
import { type Commands } from '@/app/commands';

const useCommands = () => {
  const [, setDisplay] = useAtom(displayAtom);
  const [input, setInput] = useAtom(inputAtom);
  const [history, setHistory] = useAtom(historyAtom);
  const [historyIndex, setHistoryIndex] = useAtom(historyIndexAtom);

  const executeCommand = (commandLine: string) => {
    const [commandName, ...args] = commandLine.trim().split(' ');
    const { args: parsedArgs, flags, all } = parseArgsAndFlags(args);
    
    handleCommand({
      command: commandName as Commands,
      args: parsedArgs,
      flags,
      all,
    });

    setHistory((prev) => [...prev, commandLine]);
    setHistoryIndex(-1);
    setInput('');
  };

  const clearDisplay = () => {
    setDisplay([]);
  };

  const replaceDisplay = () => {
    setDisplay(prev => [prev[prev.length - 1]]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      executeCommand(input);
    } else if (event.key === 'ArrowUp') {
      if (history.length > 0) {
        const newIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (event.key === 'ArrowDown') {
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    }
  };

  return { handleKeyDown, input, setInput, clearDisplay, replaceDisplay };
};

export default useCommands;
