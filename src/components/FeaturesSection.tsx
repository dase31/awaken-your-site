const features = [
  {
    title: "Discover the true purpose of meditation.",
    description:
      "Go beyond simple relaxation techniques and experience the freedom of real mindfulness—without any New Age fluff.",
  },
  {
    title: "Understand why you're practicing.",
    description:
      "Don't just meditate. Understand the theory of mindfulness, with the best of ancient wisdom pressure-tested by modern science.",
  },
  {
    title: "Live an examined, fulfilling life.",
    description:
      "Listen to lessons and conversations on Stoicism, effective altruism, sleep, psychedelics research, and more.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <h3 className="text-foreground text-xl font-serif leading-snug">
                {feature.title}
              </h3>
              <p className="text-foreground/80 mt-4 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
