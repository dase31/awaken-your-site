interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "I hear you..." }: LoadingStateProps) {
  return (
    <div className="fade-in-up text-center">
      <h2 
        className="font-serif text-foreground text-2xl md:text-3xl opacity-80"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        {message}
      </h2>
      <div className="mt-6 flex justify-center gap-2">
        <span 
          className="w-2 h-2 rounded-full bg-white/60 animate-pulse" 
          style={{ animationDelay: "0s" }} 
        />
        <span 
          className="w-2 h-2 rounded-full bg-white/60 animate-pulse" 
          style={{ animationDelay: "0.2s" }} 
        />
        <span 
          className="w-2 h-2 rounded-full bg-white/60 animate-pulse" 
          style={{ animationDelay: "0.4s" }} 
        />
      </div>
    </div>
  );
}
