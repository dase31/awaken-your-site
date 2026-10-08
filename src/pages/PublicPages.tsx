import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TermsContent, PrivacyContent, SupportContent } from "@/components/legal/LegalContent";
import { CrisisResources } from "@/components/safety/CrisisResources";

// Reachable without an account — Apple and App Review need these as plain
// URLs, and someone in distress shouldn't need to sign in to find help.
function PublicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

  return (
    <div className="min-h-screen bg-sky-gradient relative overflow-x-hidden">
      <div
        className="relative z-10 max-w-xl mx-auto px-5 pb-24"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 2rem)" }}
      >
        <button
          onClick={back}
          className="mb-8 inline-flex items-center gap-2 text-white/70 text-sm hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        {/* Long text needs more contrast than the open sky gives it */}
        <div className="bg-[hsl(205,55%,28%)]/55 backdrop-blur-xl border border-white/15 rounded-3xl px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export const TermsPage = () => (
  <PublicLayout>
    <TermsContent />
  </PublicLayout>
);

export const PrivacyPage = () => (
  <PublicLayout>
    <PrivacyContent />
  </PublicLayout>
);

export const SupportPage = () => (
  <PublicLayout>
    <SupportContent />
  </PublicLayout>
);

export const CrisisPage = () => (
  <PublicLayout>
    <h1
      className="font-serif text-white text-4xl mb-3"
      style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
    >
      Support right now
    </h1>
    <p className="text-white/70 text-base leading-relaxed mb-8">
      Thymos isn't a crisis service. If you're struggling or in danger, these services are free,
      confidential, and available now.
    </p>
    <CrisisResources />
  </PublicLayout>
);
