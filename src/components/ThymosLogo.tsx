import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

interface ThymosLogoProps {
  className?: string;
  showSettings?: boolean;
}

const ThymosLogo = ({ className = "", showSettings = false }: ThymosLogoProps) => {
  const navigate = useNavigate();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center relative">
        <h1 className="text-foreground text-xl md:text-2xl font-medium tracking-[0.3em] uppercase">
          Thymos
        </h1>
        {showSettings && (
          <button
            onClick={() => navigate("/settings")}
            className="absolute right-0 text-white/70 hover:text-white transition-colors p-1"
            aria-label="Settings"
          >
            <Settings size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ThymosLogo;
