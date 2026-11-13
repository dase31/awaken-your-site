import { useLocation, useNavigate } from "react-router-dom";
import { TabHomeIcon, TabChatIcon, TabConnectIcon, TabTelosIcon } from "@/components/icons/ThymosIcons";

const tabs = [
  { icon: <TabHomeIcon width={20} height={20} />, label: "Home", route: "/home" },
  { icon: <TabChatIcon width={20} height={20} />, label: "Chat", route: "/chat" },
  { icon: <TabConnectIcon width={20} height={20} />, label: "Connect", route: "/connect" },
  { icon: <TabTelosIcon width={20} height={20} />, label: "Telos", route: "/telos" },
];

// Floating glass tab bar; the active tab is a solid ink pill.
export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="th-tabbar" aria-label="Main">
      {tabs.map((tab) => (
        <button
          key={tab.route}
          type="button"
          className="th-tab"
          aria-current={location.pathname === tab.route ? "page" : undefined}
          onClick={() => navigate(tab.route)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
