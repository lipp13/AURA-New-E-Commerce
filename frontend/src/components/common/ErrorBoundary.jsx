import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-neutral-900 text-white font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-800 border border-neutral-700 text-center space-y-4">
            <h2 className="text-2xl font-bold text-rose-500">Something went wrong</h2>
            <p className="text-xs text-neutral-400 font-mono bg-neutral-900 p-4 rounded-xl text-left overflow-x-auto">
              {this.state.error?.toString()}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
