import { Star } from "lucide-react";

const reviews = [
  "Utterly life changing. Continues to be one of the best investments of my life and has probably saved my life.",
  "The single most important app I have ever downloaded.",
  "I've been using Waking up since 2018, and it's the most important thing I've done in my life.",
  "I'm a beginner and this app has changed my entire perception of meditation.",
  "I've tried them all. I've had more insight just doing the intro course.",
];

const ReviewsSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-foreground text-lg font-serif italic leading-relaxed">
                "{review}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-foreground text-4xl font-bold">100,000+</p>
          <p className="text-foreground/80 mt-1">5-star reviews</p>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
