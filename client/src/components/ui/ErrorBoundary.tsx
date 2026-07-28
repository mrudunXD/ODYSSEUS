import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught React UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#E5E7EB] card-shadow text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-[#DC2626] flex items-center justify-center mx-auto font-extrabold text-xl">
              !
            </div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">Something went wrong</h2>
            <p className="text-xs text-[#6B7280]">
              An unexpected UI error occurred. Our team has been notified.
            </p>
            <div className="p-3 bg-[#F5F5F0] rounded-xl text-[11px] font-mono text-left text-rose-700 overflow-x-auto max-h-28">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#E85D04] text-white font-extrabold text-xs rounded-2xl shadow-md hover:bg-[#C44D00] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
