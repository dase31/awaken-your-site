import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <OnboardingFrame hideChrome>
      <div className="th-card-lg fade-in-up">
        <p className="th-h1 text-[4.5rem] leading-none text-[color:var(--th-umber-light)]">404</p>
        <h1 className="th-h1 mt-3 text-[1.5rem]">This page drifted away.</h1>
        <p className="th-sub mb-6 mt-2">It may have floated off with the clouds.</p>
        <a href="/" className="th-btn">
          Return home
        </a>
      </div>
    </OnboardingFrame>
  );
};

export default NotFound;
