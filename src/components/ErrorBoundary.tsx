import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface Props {
  children: ReactNode;
}
interface State {
  failed: boolean;
}

// Catches anything a screen throws while rendering so the app never turns
// into a blank page. The fallback uses plain links and a hard reload on
// purpose: if the router or a provider is what broke, nothing else is
// guaranteed to work.
class Boundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Screen crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-hidden bg-[#F7F5F1]">
        <div className="th-ambient" aria-hidden="true" />
        <div className="th-brand-mark">THYMOS</div>
        <main
          className="relative z-10 flex flex-1 flex-col justify-center px-5"
          style={{
            paddingTop: "calc(max(22px, env(safe-area-inset-top)) + 3rem)",
            paddingBottom: "max(28px, env(safe-area-inset-bottom))",
          }}
          role="alert"
        >
          <div className="th-card-lg mx-auto max-w-md">
            <h1 className="th-h1 text-[1.7rem]">Something went wrong.</h1>
            <p className="th-sub mb-6 mt-2">
              That's on us, not you. Try again, and if it keeps happening, write to us.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button type="button" className="th-btn" onClick={() => window.location.reload()}>
                Try again
              </button>
              <a href="/home" className="th-text-link">
                Go to Home
              </a>
              <a href="/support" className="th-text-link">
                Get help
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

// Keyed by route so that moving to another screen clears a crash instead of
// leaving the fallback up for the rest of the session.
export function ErrorBoundary({ children }: Props) {
  const { pathname } = useLocation();
  return <Boundary key={pathname}>{children}</Boundary>;
}
