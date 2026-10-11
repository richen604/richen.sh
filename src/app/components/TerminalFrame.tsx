import type { KeyboardEvent, MouseEvent, ReactNode, Ref } from "react";
import { formatPromptPath, homePath } from '../utils/identity.ts';

export interface TerminalFrameProps {
  children?: ReactNode;
  showCLI?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  cwd?: string;
  clock?: string;
  inputRef?: Ref<HTMLInputElement>;
  displayRef?: Ref<HTMLDivElement>;
  onHelp?: () => void;
  onClear?: () => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

/** Pure frame: identical markup for static output and first hydration render. */
export function TerminalFrame({ children, showCLI = true, onKeyDown, cwd = homePath, clock = "--:--:--", inputRef, displayRef, onHelp, onClear, onClick }: TerminalFrameProps) {
  return <main onClick={onClick} className="h-screen flex flex-col overflow-hidden text-sm md:text-base lg:text-lg font-mono p-2 leading-tight">
    <nav aria-label="Primary navigation" className="flex pb-2 flex-shrink-0 text-sm md:text-base lg:text-lg">
      <div className="flex space-x-1">
        <a href="/" className="flex items-center justify-center px-1 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer">terminal</a>
        {(["blog", "projects", "contact"] as const).map((name) => <a key={name} href={`/${name}/`} className="flex items-center justify-center px-1 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer">{name}</a>)}
      </div>
      <div className="flex space-x-4 ml-auto">
        {!showCLI ? <a href="/" className="flex items-center justify-center px-1 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer">↩ back</a> : <div className="flex flex-shrink">
          <button onClick={onHelp} className="flex items-center justify-center w-6 h-6 mr-2 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer transition-colors" aria-label="Help">?</button>
          <button onClick={onClear} className="flex items-center justify-center w-6 h-6 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer transition-colors" aria-label="Clear Display">×</button>
        </div>}
      </div>
    </nav>
    <div ref={displayRef} id="terminal-output" className="flex-[0_1_auto] min-h-0 overflow-auto scrollbar-thin" style={{ overflowAnchor: "none" }}>{children}</div>
    {showCLI && <div className="w-full min-w-0 py-2 flex flex-shrink-0 items-center gap-2 text-base md:text-base lg:text-lg">
      <span className="text-[#929bc2] truncate max-w-[30%]" title={cwd}>{formatPromptPath(cwd)}</span>
      <span className="shrink-0">❯</span>
      <input ref={inputRef} className="terminal-input bg-transparent outline-none min-w-0 flex-1 placeholder-gray-500" onKeyDown={onKeyDown} aria-label="Terminal command" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="" />
      <span className="shrink-0 text-nowrap text-xs md:text-sm lg:text-base opacity-60">{clock}</span>
    </div>}
  </main>;
}
