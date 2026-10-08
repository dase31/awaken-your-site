const Header = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 pb-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <h1 className="text-foreground text-xl md:text-2xl font-medium tracking-[0.3em] uppercase">
          Thymos
        </h1>
      </div>
    </header>
  );
};

export default Header;
