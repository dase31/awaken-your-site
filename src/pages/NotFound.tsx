import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-gradient">
      <div className="text-center px-6">
        <h1
          className="font-serif text-white font-bold mb-3"
          style={{ fontSize: "7rem", lineHeight: 1, textShadow: "0 2px 24px rgba(0,60,120,0.3)" }}
        >
          404
        </h1>
        <p className="font-serif text-white/80 text-xl mb-2">
          This page drifted away.
        </p>
        <p className="text-white/50 text-sm mb-10">
          It may have floated off with the clouds.
        </p>
        <a
          href="/"
          className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium px-8 py-3 rounded-full hover:bg-white/30 transition-all duration-300"
        >
          Return home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
