import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CircleIcon, RestIcon } from "@/components/icons/ThymosIcons";
import { useUserSettings } from "@/hooks/useUserSettings";

interface EmptyMatchStateProps {
  // "paused" / "at_limit" mean the person's own settings stopped the search.
  reason?: string | null;
  // Called after matching is resumed so the page can search again.
  onResume?: () => void;
}

export function EmptyMatchState({ reason, onResume }: EmptyMatchStateProps) {
  const navigate = useNavigate();
  const { update } = useUserSettings();

  const resume = async () => {
    const ok = await update({ matchingPaused: false });
    if (!ok) {
      toast.error("Couldn't resume matching. Please try again.");
      return;
    }
    onResume?.();
  };

  if (reason === "paused") {
    return (
      <div className="th-card-lg fade-in-up">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#E9E2D4" }}>
          <RestIcon width={28} height={28} />
        </div>
        <h1 className="th-h1 text-[1.6rem]">Matching is paused</h1>
        <p className="th-sub mb-6 mt-2">You're resting, and that's fine. Your conversations are still here.</p>
        <div className="flex flex-col items-center gap-3">
          <button type="button" onClick={resume} className="th-btn">
            Resume matching
          </button>
          <button type="button" onClick={() => navigate("/home")} className="th-text-link">
            Back home
          </button>
        </div>
      </div>
    );
  }

  if (reason === "at_limit") {
    return (
      <div className="th-card-lg fade-in-up">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#E2E9F1" }}>
          <CircleIcon width={28} height={28} />
        </div>
        <h1 className="th-h1 text-[1.6rem]">You're at your limit</h1>
        <p className="th-sub mb-6 mt-2">
          You've reached the number of connections you chose. Raise the limit when you have room for someone new.
        </p>
        <div className="flex flex-col items-center gap-3">
          <button type="button" onClick={() => navigate("/settings")} className="th-btn">
            Change my limit
          </button>
          <button type="button" onClick={() => navigate("/home")} className="th-text-link">
            Back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="th-card-lg fade-in-up">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#E2E9F1" }}>
        <CircleIcon width={28} height={28} />
      </div>
      <h1 className="th-h1 text-[1.6rem]">You're among the first</h1>
      <p className="th-sub mb-6 mt-2">
        We're building your network. We'll let you know when someone resonates.
      </p>
      <button type="button" onClick={() => navigate("/home")} className="th-btn">
        Continue to Home
      </button>
    </div>
  );
}
