import { cn } from "@/lib/utils";

interface MatchIntroProps {
  userName: string;
  matchName: string;
  sharedStruggles: string[];
  sharedGoals: string[];
  sharedIntents: string[];
  onConnect: () => void;
  onFindAnother: () => void;
  isLoadingAnother?: boolean;
}

function formatTagList(tags: string[]): string {
  if (tags.length === 0) return "";
  if (tags.length === 1) return tags[0].replace(/_/g, " ");
  if (tags.length === 2) return `${tags[0].replace(/_/g, " ")} and ${tags[1].replace(/_/g, " ")}`;
  
  const formatted = tags.map((t) => t.replace(/_/g, " "));
  return `${formatted.slice(0, -1).join(", ")}, and ${formatted[formatted.length - 1]}`;
}

function buildConnectionSentence(
  struggles: string[],
  goals: string[],
  intents: string[]
): string {
  const parts: string[] = [];

  if (struggles.length > 0) {
    parts.push(`carrying ${formatTagList(struggles)}`);
  }

  if (goals.length > 0) {
    parts.push(`reaching for ${formatTagList(goals)}`);
  }

  if (intents.length > 0) {
    parts.push(`looking for ${formatTagList(intents)}`);
  }

  if (parts.length === 0) {
    return "You both are on similar journeys.";
  }

  if (parts.length === 1) {
    return `You both are ${parts[0]}.`;
  }

  if (parts.length === 2) {
    return `You both are ${parts[0]} and ${parts[1]}.`;
  }

  return `You both are ${parts[0]}, ${parts[1]}, and ${parts[2]}.`;
}

export function MatchIntro({
  userName,
  matchName,
  sharedStruggles,
  sharedGoals,
  sharedIntents,
  onConnect,
  onFindAnother,
  isLoadingAnother = false,
}: MatchIntroProps) {
  const connectionSentence = buildConnectionSentence(
    sharedStruggles,
    sharedGoals,
    sharedIntents
  );

  return (
    <div className="fade-in-up text-center px-6 max-w-md w-full">
      <h1
        className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-6"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        {userName}, meet {matchName}
      </h1>

      <p
        className="font-serif text-foreground/80 text-lg md:text-xl leading-relaxed mb-10"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        "{connectionSentence}"
      </p>

      <button
        onClick={onConnect}
        className={cn(
          "px-8 py-3 rounded-full font-serif text-lg transition-all duration-300",
          "bg-white/20 border border-white/50 text-primary",
          "hover:bg-white/30 hover:scale-[1.02] focus:outline-none"
        )}
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        Connect
      </button>

      <button
        onClick={onFindAnother}
        disabled={isLoadingAnother}
        className={cn(
          "block mx-auto mt-6 font-serif text-base transition-all duration-300",
          "text-foreground/50 hover:text-foreground/80",
          isLoadingAnother && "opacity-50 cursor-not-allowed"
        )}
      >
        {isLoadingAnother ? "Finding..." : "Find another connection"}
      </button>
    </div>
  );
}
