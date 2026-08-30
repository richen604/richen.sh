import React, { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorFallbackProps {
  error?: Error;
  onReset: () => void;
  fullPage?: boolean;
}

export function ErrorFallback({ error, onReset, fullPage = false }: ErrorFallbackProps) {
  return (
    <main
      className={`${fullPage ? 'h-screen ' : ''}flex flex-col items-center justify-center text-sm md:text-base lg:text-lg font-mono p-10 bg-black text-white`}
      role="alert"
    >
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-2xl font-bold">Something went wrong!</h1>
        <div className="space-y-4">
          <p className="text-gray-300">
            Try resetting the terminal to clear any corrupted state:
          </p>
          <button
            onClick={onReset}
            className="bg-white/10 hover:bg-white/20 focus:bg-white/20 border border-white/20 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Reset Terminal
          </button>
          <p className="text-gray-500 text-sm">
            This will clear the display and restart the application
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-xs">
            If the problem persists, please refresh the page or contact support.
          </p>
          {error?.message && <p className="sr-only">{error.message}</p>}
        </div>
      </div>
    </main>
  );
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return this.props.fallback?.(this.state.error, this.reset) ?? (
        <ErrorFallback error={this.state.error} onReset={this.reset} />
      );
    }

    return this.props.children;
  }
}
