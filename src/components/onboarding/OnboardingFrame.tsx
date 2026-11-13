import type { ReactNode } from "react";

interface OnboardingFrameProps {
  /** Full-clarity photo (landing, Greek-soul intro) instead of the blurred ambient sky. */
  photo?: boolean;
  /** Progress dots under the wordmark. Omit for none. */
  progress?: { current: number; total: number };
  /** Shows the back button in the row under the wordmark. */
  onBack?: () => void;
  /** Hides the dots/back row entirely (landing). */
  hideChrome?: boolean;
  /** Wider column for long reading (legal, support). */
  wide?: boolean;
  children: ReactNode;
}

/**
 * Root for every onboarding screen. The photo and its blurred ambient twin
 * are fixed to the screen and crossfade; the THYMOS wordmark sits centred on
 * its own row at the top; back and progress sit on the row beneath it.
 */
export function OnboardingFrame({ photo = false, progress, onBack, hideChrome, wide, children }: OnboardingFrameProps) {
  return (
    <div className="relative flex flex-col overflow-x-hidden bg-[#F7F5F1] min-h-screen min-h-[100dvh]">
      <div className="th-hero" style={{ opacity: photo ? 1 : 0 }} aria-hidden="true" />
      <div className="th-ambient th-layer-fade" style={{ opacity: photo ? 0 : 1 }} aria-hidden="true" />

      <div className="th-brand-mark">THYMOS</div>

      {!hideChrome && (
        <div className="th-topbar" style={{ justifyContent: "flex-start", gap: 12 }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="th-icon-btn shrink-0"
            style={{ width: 34, height: 34, visibility: onBack ? "visible" : "hidden" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          {progress && (
            <div
              className="th-progress"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={progress.total}
              aria-valuenow={progress.current}
              aria-label="Onboarding progress"
            >
              {Array.from({ length: progress.total }, (_, i) => (
                <i key={i} className={i < progress.current ? "done" : ""} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* my-auto on the inner wrapper centres short steps and lets tall ones scroll */}
      <main
        className="relative z-10 flex flex-1 flex-col px-5"
        style={{
          paddingTop: hideChrome ? "calc(max(22px, env(safe-area-inset-top)) + 3rem)" : "1.5rem",
          paddingBottom: "max(28px, env(safe-area-inset-bottom))",
        }}
      >
        <div className={`my-auto mx-auto w-full ${wide ? "max-w-xl" : "max-w-md"}`}>{children}</div>
      </main>
    </div>
  );
}
