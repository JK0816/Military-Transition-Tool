import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Reverted state initialization to use a constructor. The previous public class field
  // initialization can sometimes cause type inference issues with `this.props` in certain setups.
  // Using a constructor is a more robust pattern.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4">
            <div className="text-center py-12 px-6 bg-slate-800/50 border border-dashed border-red-600/50 rounded-xl max-w-2xl mx-auto">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto" />
                <h1 className="text-2xl font-bold text-red-300 mt-4">Oops! Something Went Wrong</h1>
                <p className="text-red-400/80 mt-2 max-w-lg mx-auto">
                    An unexpected error occurred. This can sometimes happen if saved data is corrupted. You can try reloading, or clear the saved data and start over.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors"
                        aria-label="Reload the page"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={() => {
                            try {
                                // Be specific to avoid clearing other potential site data
                                localStorage.removeItem('transitionPlan');
                                localStorage.removeItem('userProfile');
                                window.location.reload();
                            } catch (e) {
                                console.error("Failed to clear local storage:", e);
                                alert("Could not clear saved data. Please clear your site data manually through your browser settings.");
                            }
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-red-800/70 text-red-200 font-semibold rounded-md hover:bg-red-700 transition-colors border border-red-700/80"
                        aria-label="Clear saved data and start over"
                    >
                        Clear Data & Start Over
                    </button>
                </div>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;