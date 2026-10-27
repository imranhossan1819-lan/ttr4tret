import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 text-white">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-red-500/30 p-6 text-center space-y-4 shadow-2xl">
            <div className="h-12 w-12 rounded-xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold">অ্যাপ রেন্ডার করতে সমস্যা হয়েছে</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে। আবার চেষ্টা করুন।'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold text-white transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>রিলোড করুন</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
