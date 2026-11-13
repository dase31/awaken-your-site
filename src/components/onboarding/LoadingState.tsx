interface LoadingStateProps {
  message?: string;
}

// Sits straight on the sky (white with a soft shadow), no card.
export function LoadingState({ message = "I hear you..." }: LoadingStateProps) {
  return (
    <div className="fade-in-up text-center" role="status" aria-live="polite">
      <h2 className="th-h1 th-on-sky text-2xl md:text-3xl">{message}</h2>
      <div className="mt-6 flex justify-center gap-2">
        {[0, 0.2, 0.4].map((d) => (
          <span
            key={d}
            className="h-2 w-2 rounded-full bg-white animate-pulse motion-reduce:animate-none"
            style={{ animationDelay: `${d}s`, boxShadow: "0 1px 6px rgba(10,20,35,0.3)" }}
          />
        ))}
      </div>
    </div>
  );
}
