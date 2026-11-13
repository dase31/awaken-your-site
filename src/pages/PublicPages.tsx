import { useNavigate } from "react-router-dom";
import { TermsContent, PrivacyContent, SupportContent } from "@/components/legal/LegalContent";
import { CrisisResources } from "@/components/safety/CrisisResources";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";

// Reachable without an account — Apple and App Review need these as plain
// URLs, and someone in distress shouldn't need to sign in to find help.
function PublicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate("/"));

  return (
    <OnboardingFrame onBack={back} wide>
      {/* Long text sits on paper-strength glass so it stays readable over the sky */}
      <div className="th-sheet th-legal-paper px-6 py-8">{children}</div>
    </OnboardingFrame>
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
    <h1 className="th-h1 mb-3 text-[2rem]">Support right now</h1>
    <p className="th-sub mb-6 text-base">
      Thymos isn't a crisis service. If you're struggling or in danger, these services are free,
      confidential, and available now.
    </p>
    <CrisisResources />
  </PublicLayout>
);
