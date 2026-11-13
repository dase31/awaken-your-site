import { useEffect } from "react";
import { toast } from "sonner";

// Failures that happen outside rendering (a rejected promise nobody awaited, a
// script error in an event handler) never reach the error boundary. Without
// this they fail silently and the screen just stops responding.
export function useGlobalErrorToasts() {
  useEffect(() => {
    let last = 0;
    const notify = (kind: string, detail: unknown) => {
      console.error(`Unhandled ${kind}:`, detail);
      // One toast at a time; a failing loop shouldn't bury the screen.
      const now = Date.now();
      if (now - last < 4000) return;
      last = now;
      toast.error("Something went wrong. Please try again.");
    };

    const onRejection = (e: PromiseRejectionEvent) => notify("rejection", e.reason);
    const onError = (e: ErrorEvent) => {
      // Browsers raise this harmless layout notice as a window error.
      if (e.message?.includes("ResizeObserver")) return;
      notify("error", e.error ?? e.message);
    };

    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, []);
}
