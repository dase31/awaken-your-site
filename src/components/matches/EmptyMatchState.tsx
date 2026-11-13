import { useNavigate } from "react-router-dom";
import { CircleIcon } from "@/components/icons/ThymosIcons";

export function EmptyMatchState() {
  const navigate = useNavigate();

  return (
    <div className="th-card-lg fade-in-up">
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "#E2E9F1" }}
      >
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
