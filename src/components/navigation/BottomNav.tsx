import { Home, MessageCircle, Users, Target } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  route: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function NavItem({ icon, label, isActive, onClick, disabled }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-all duration-200 relative",
        isActive ? "text-white" : "text-white/45 hover:text-white/70",
        disabled && "text-white/25 cursor-not-allowed"
      )}
    >
      {isActive && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
      )}
      <span className={cn("transition-transform duration-200", isActive && "scale-110")}>
        {icon}
      </span>
      <span className={cn("text-xs transition-all duration-200", isActive ? "font-semibold" : "font-medium")}>
        {label}
      </span>
    </button>
  );
}

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems = [
    { icon: <Home size={20} />, label: "Home", route: "/home", disabled: false },
    { icon: <MessageCircle size={20} />, label: "Chat", route: "/chat", disabled: false },
    { icon: <Users size={20} />, label: "Connect", route: "/connect", disabled: false },
    { icon: <Target size={20} />, label: "Telos", route: "/telos", disabled: false },
  ];

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-white/12 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
      style={{ bottom: "max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
    >
      <div className="flex items-center h-14 px-1">
        {navItems.map((item) => (
          <NavItem
            key={item.route}
            icon={item.icon}
            label={item.label}
            route={item.route}
            isActive={currentPath === item.route}
            onClick={() => !item.disabled && navigate(item.route)}
            disabled={item.disabled}
          />
        ))}
      </div>
    </nav>
  );
}
