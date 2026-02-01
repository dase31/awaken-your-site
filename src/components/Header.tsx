import { Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button 
          className="p-2 text-foreground hover:opacity-80 transition-opacity"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <Menu className="w-8 h-8" />
        </button>

        <h1 className="text-foreground text-xl md:text-2xl font-medium tracking-[0.3em] uppercase">
          Waking Up
        </h1>

        <button className="text-foreground font-medium hover:opacity-80 transition-opacity tracking-wide">
          LOGIN
        </button>
      </div>
    </header>
  );
};

export default Header;
