export function EmptyMatchState() {
  return (
    <div className="fade-in-up text-center px-6 max-w-md w-full">
      <h1
        className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        You're among the first
      </h1>

      <p
        className="font-serif text-foreground/70 text-lg md:text-xl leading-relaxed"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        We're building your network. We'll let you know when someone resonates.
      </p>
    </div>
  );
}
