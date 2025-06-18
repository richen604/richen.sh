import React, { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { displayAtom, store } from "../store";
import { fileSystemAtom } from "../utils/filesystem";
import Link from "next/link";

interface TerminalLayoutProps {
  children?: React.ReactNode;
  showCLI?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  title?: string;
}

const TerminalLayout: React.FC<TerminalLayoutProps> = ({
  children,
  showCLI = true,
  onKeyDown,
}) => {
  const [display] = useAtom(displayAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [filesystem] = useAtom(fileSystemAtom);

  useEffect(() => {
    if (showCLI && inputRef.current) {
      inputRef.current.focus();
    }
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  }, [display, showCLI]);

  const handleMainClick = (e: React.MouseEvent) => {
    if (showCLI && inputRef.current) {
      // Don't focus if clicking on interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, select, input, textarea, a, [role="button"], [role="menu"], [role="menuitem"]');

      if (!isInteractive) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <main
      ref={mainRef}
      className="h-screen flex flex-col overflow-hidden text-sm md:text-base lg:text-lg font-mono p-2 leading-tight"
      onClick={handleMainClick}
    >
      <nav className="flex pb-2 flex-shrink-0 text-sm md:text-base lg:text-lg">
        <div className="flex space-x-1 ">
          <Link
            prefetch
            href="/projects"
            className="flex items-center justify-center px-1 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer"
          >
            projects
          </Link>
          <Link
            prefetch
            href="/contact"
            className="flex items-center justify-center px-1 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer"
          >
            contact
          </Link>
        </div>
        <div className="flex space-x-4 ml-auto">
          {!showCLI && (
            <Link
              prefetch
              href="/"
              className="flex items-center justify-center px-1 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer"
            >
              ↩ back
            </Link>
          )}
          {showCLI && (
            <div className="flex flex-shrink">
              <button
                onClick={() => {
                  store.set(displayAtom, [
                    JSON.stringify({
                      componentKey: "help",
                      timestamp: new Date().toISOString(),
                    }),
                  ]);
                }}
                className="flex items-center justify-center w-6 h-6 mr-2 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer transition-colors"
                aria-label="Help"
              >
                ?
              </button>
              <button
                onClick={() => {
                  store.set(displayAtom, []);
                }}
                className="flex items-center justify-center w-6 h-6 rounded-md focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer transition-colors"
                aria-label="Clear Display"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </nav>

      <div
        ref={displayRef}
        className="overflow-y-auto scrollbar-thin"
        onClick={handleMainClick}
      >
        {children}
      </div>

      {showCLI && (
        <div className="flex w-full min-w-0 py-2 flex-shrink-0 items-center h-10 min-h-10 text-base md:text-base lg:text-lg">
          <div className="flex items-center">
            {/* Monochromatic powerlevel10k style segments */}
            <div className="flex items-center bg-white/10 px-2 py-0 rounded-l-md border-l-2">
              <span className="">📁</span>
            </div>
            <div className="flex items-center bg-white/5 px-3 py-0 rounded-r-md">
              <span className="font-medium">
                {"~/" + filesystem.cwd.slice(1).join('/')}
              </span>
            </div>
            <div className="ml-2 font-bold">❯</div>
          </div>
          <input
            ref={inputRef}
            className="bg-transparent outline-none ml-2 min-w-0 flex-grow placeholder-gray-500"
            onKeyDown={onKeyDown}
            placeholder=""
          />
          <span className="text-nowrap ml-2 text-xs md:text-sm lg:text-base opacity-60">
            {new Date().toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      )}

      {!showCLI && null}
    </main>
  );
};

export default TerminalLayout; 