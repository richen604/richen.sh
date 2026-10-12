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
  activeTab?: "terminal" | "blog" | "projects" | "contact";
}

/** Pure frame: identical markup for static output and first hydration render. */
export function TerminalFrame({ children, showCLI = true, onKeyDown, cwd = homePath, clock = "--:--:--", inputRef, displayRef, onHelp, onClear, onClick, activeTab = "terminal" }: TerminalFrameProps) {
  return <main onClick={onClick} className="h-screen flex flex-col overflow-hidden text-sm md:text-base lg:text-lg font-mono p-2 leading-tight">
    <nav aria-label="Primary navigation" className="terminal-tabs text-sm md:text-base lg:text-lg">
      <div className="terminal-tabs-pages">
        {(["terminal", "blog", "projects", "contact"] as const).map((name) => <a key={name} href={name === "terminal" ? "/" : `/${name}/`} className="terminal-tab" aria-current={activeTab === name ? "page" : undefined}>{name}</a>)}
      </div>
      <div className="terminal-tabs-actions">
        {!showCLI ? <a href="/" className="terminal-tab">↩ back</a> : <>
          <button onClick={onHelp} className="terminal-tab" aria-label="Help">?</button>
          <button onClick={onClear} className="terminal-tab" aria-label="Clear Display">×</button>
        </>}
      </div>
    </nav>
    <div ref={displayRef} id="terminal-output" className="flex-[0_1_auto] min-h-0 overflow-auto scrollbar-thin" style={{ overflowAnchor: "none" }}>{children}</div>
    {showCLI && <div className="w-full min-w-0 py-2 flex flex-shrink-0 items-center gap-2 text-base md:text-base lg:text-lg">
      <span className="text-accent truncate max-w-[30%]" title={cwd}>{formatPromptPath(cwd)}</span>
      <span className="shrink-0 text-accent">❯</span>
      <input ref={inputRef} className="terminal-input bg-transparent outline-none min-w-0 flex-1 placeholder-muted" onKeyDown={onKeyDown} aria-label="Terminal command" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="" />
      <span className="shrink-0 text-nowrap text-xs md:text-sm lg:text-base text-secondary-accent">{clock}</span>
    </div>}
  </main>;
}
