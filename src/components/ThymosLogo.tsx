interface ThymosLogoProps {
  className?: string;
}

const ThymosLogo = ({ className = "" }: ThymosLogoProps) => {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <h1 className="text-foreground text-xl md:text-2xl font-medium tracking-[0.3em] uppercase">
          Thymos
        </h1>
      </div>
    </div>
  );
};

export default ThymosLogo;
