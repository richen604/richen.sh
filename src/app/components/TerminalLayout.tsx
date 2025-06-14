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
    if (showCLI && inputRef.current && (e.target === mainRef.current || e.target === displayRef.current)) {
      inputRef.current.focus();
    }
  };

  return (
    <main
      ref={mainRef}
      className="h-screen flex flex-col overflow-hidden text-sm md:text-base lg:text-lg font-mono p-10"
      onClick={handleMainClick}
    >
      <nav className="flex mb-4 flex-shrink-0">
        <div className="flex space-x-4 ">
          <Link
            prefetch
            href="/projects"
            className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer"
          >
            projects
          </Link>
          <Link
            prefetch
            href="/contact"
            className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer"
          >
            contact
          </Link>
        </div>
        <div className="flex space-x-4 ml-auto">
          {!showCLI && (
            <Link
              prefetch
              href="/"
              className="focus:bg-[#ffffff1a] hover:bg-[#ffffff1a] cursor-pointer"
            >
              ↩ back
            </Link>
          )}
          {showCLI && (
            <>
              <button
                onClick={() => {
                  store.set(displayAtom, [
                    JSON.stringify({
                      componentKey: "help",
                      timestamp: new Date().toISOString(),
                    }),
                  ]);
                }}
                className="text-center w-4 h-4 focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
              >
                ?
              </button>
              <button
                onClick={() => {
                  store.set(displayAtom, []);
                }}
                className="text-center w-4 h-4 focus:bg-[#ffffff1a] hover:bg-[#ffffff1a]"
                aria-label="Clear Display"
              >
                x
              </button>
            </>
          )}
        </div>
      </nav>

      <div
        ref={displayRef}
        className="overflow-y-auto"
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
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}

      {!showCLI && null}
    </main>
  );
};

export default TerminalLayout; 