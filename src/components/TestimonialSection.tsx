import peterAttia from "@/assets/peter-attia.jpg";

const TestimonialSection = () => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={peterAttia}
              alt="Peter Attia"
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
            <div>
              <blockquote className="text-card-foreground text-xl md:text-2xl font-serif italic leading-relaxed">
                "Waking Up is, hands down, the most important meditation guide I've ever used."
              </blockquote>
              <div className="mt-4">
                <p className="text-card-foreground font-semibold">Peter Attia</p>
                <p className="text-card-foreground/60 text-sm">
                  Physician, #1 New York Times best-selling author of Outlive, host of The Drive podcast
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
