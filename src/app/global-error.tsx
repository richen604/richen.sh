'use client';

import React from 'react';
import useCommands from './hooks/useCommands';

export default function GlobalError() {
  const { resetDisplay } = useCommands();
  const handleReset = () => {
    // Clear the display atom like the reset button in TerminalLayout
    resetDisplay();
    // Reload the page
    window.location.reload();
  };

  return (
    <html>
      <body>
        <main className="h-screen flex flex-col items-center justify-center text-sm md:text-base lg:text-lg font-mono p-10 bg-black text-white">
          <div className="max-w-2xl text-center space-y-6">

            <h1 className="text-2xl font-bold *:mb-4">
              Something went wrong!
            </h1>

            <div className="space-y-4">
              <p className="text-gray-300">
                Try resetting the terminal to clear any corrupted state:
              </p>

              <button
                onClick={handleReset}
                className="bg-white/10 hover:bg-white/20 focus:bg-white/20 border border-white/20 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                🔄 Reset Terminal
              </button>

              <p className="text-gray-500 text-sm">
                This will clear the display and restart the application
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-xs">
                If the problem persists, please refresh the page or contact support.
              </p>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
