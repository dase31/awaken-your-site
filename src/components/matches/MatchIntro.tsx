import { PersonAvatar } from "@/components/PersonAvatar";

interface MatchIntroProps {
  userName: string;
  matchName: string;
  sharedStruggles: string[];
  sharedGoals: string[];
  sharedIntents: string[];
  matchQuote?: string | null;
  onConnect: () => void;
  onFindAnother: () => void;
  onConnectLater: () => void;
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
  matchQuote,
  onConnect,
  onFindAnother,
  onConnectLater,
  isLoadingAnother = false,
}: MatchIntroProps) {
  const connectionSentence = buildConnectionSentence(
    sharedStruggles,
    sharedGoals,
    sharedIntents
  );

  return (
    <div className="th-card-lg fade-in-up">
      <PersonAvatar name={matchName} size={64} className="mx-auto mb-4" />
      <h1 className="th-h1 mb-5 text-[1.6rem]">
        {userName}, meet {matchName}
      </h1>

      {matchQuote ? (
        <>
          <p className="th-h1 mb-2 text-[1.25rem] italic leading-relaxed" style={{ fontWeight: 400, letterSpacing: "-0.01em" }}>
            "{matchQuote}"
          </p>
          <p className="th-sub mb-7 text-[0.82rem]">— in {matchName}'s words</p>
        </>
      ) : (
        <p className="th-h1 mb-8 text-[1.15rem] italic leading-relaxed" style={{ fontWeight: 400, letterSpacing: "-0.01em" }}>
          "{connectionSentence}"
        </p>
      )}

      <button type="button" onClick={onConnect} className="th-btn">
        Connect
      </button>

      <div className="mt-5 flex flex-col items-center gap-3">
        <button type="button" onClick={onFindAnother} disabled={isLoadingAnother} className="th-text-link disabled:opacity-50">
          {isLoadingAnother ? "Finding..." : "Find another connection"}
        </button>
        <button type="button" onClick={onConnectLater} className="th-text-link">
          I'll connect later
        </button>
      </div>
    </div>
  );
}
