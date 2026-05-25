import { Component, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[8degree] root error:", error.message, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#faf8f4] p-8 text-[#1c1917]">
          <h1 className="font-serif text-xl font-bold text-[#01514E]">Something went wrong</h1>
          <p className="mt-2 text-sm text-[#1c1917]/80">{this.state.error.message}</p>
          <pre className="mt-4 max-h-[55vh] overflow-auto rounded-lg border border-[#01514E]/15 bg-white p-4 text-left text-xs text-[#1c1917]/90">
            {this.state.error.stack}
          </pre>
          <p className="mt-4 text-sm text-[#1c1917]/70">Try a hard refresh (Cmd+Shift+R). If it continues, open the browser console (Cmd+Option+J) for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>,
);
