import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Acquit UI ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0A0A0A] p-6 text-white font-mono">
          <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white tracking-wide">
                Workspace Render Interruption
              </h2>
              <p className="mt-1 text-xs text-white/60">
                The application encountered an unexpected runtime state.
              </p>
            </div>
            {this.state.error && (
              <div className="rounded-xl bg-black/40 border border-white/10 p-3 text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#174E48] hover:bg-[#1f665e] text-[#D4AF37] text-xs font-semibold shadow-lg transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Reload Case Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
