import { Component, ReactNode } from "react";

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui", color: "#1C1F1E" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, color: "#6B6F6C", fontSize: 14 }}>{this.state.error.message}</p>
          <p style={{ marginTop: 8, color: "#6B6F6C", fontSize: 12 }}>
            If this mentions Supabase env vars, check they're set in Vercel → Settings → Environment Variables, then redeploy.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
