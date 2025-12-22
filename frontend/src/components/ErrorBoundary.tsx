import React, { Component, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console (or send to logging service)
    console.error("React Error Boundary caught an error:", error);
    console.error(errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            fontFamily: "sans-serif",
            color: "#333"
          }}
        >
          <h2>⚠️ Something went wrong</h2>

          <p>
            The application encountered an unexpected error and could not
            continue.
          </p>

          <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
            {this.state.error?.message}
          </details>

          <button
            onClick={this.handleReload}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer"
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
