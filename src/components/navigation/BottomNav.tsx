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
        "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200",
        isActive
          ? "text-white"
          : "text-white/60 hover:text-white/80",
        disabled && "text-white/30 cursor-not-allowed"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems = [
    { icon: <Home size={24} />, label: "Home", route: "/home", disabled: false },
    { icon: <MessageCircle size={24} />, label: "Chat", route: "/chat", disabled: false },
    { icon: <Users size={24} />, label: "Connect", route: "/connect", disabled: true },
    { icon: <Target size={24} />, label: "Telos", route: "/telos", disabled: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(200,60%,35%)]/90 backdrop-blur-md border-t border-white/10 pb-safe">
      <div className="flex items-center h-16">
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
