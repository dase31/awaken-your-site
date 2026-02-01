import cloud2 from "@/assets/cloud-2.png";
import cloud3 from "@/assets/cloud-3.png";
import cloud4 from "@/assets/cloud-4.png";
import balloon1 from "@/assets/balloon-1.png";
import balloon2 from "@/assets/balloon-2.png";
import balloon3 from "@/assets/balloon-3.png";
import girlOnDock from "@/assets/girl-on-dock.png";
import appScreenshot1 from "@/assets/app-screenshot-1.jpg";
import appScreenshot2 from "@/assets/app-screenshot-2.jpg";
import appScreenshot3 from "@/assets/app-screenshot-3.jpg";
import momentPlayer from "@/assets/moment-player.jpg";

const showcaseItems = [
  {
    title: "Understand Your Mind, Step-by-Step",
    description:
      "Learn the fundamentals of mindfulness from Sam Harris—neuroscientist, author, and creator of Waking Up—as he also guides you into the deep end of meditation.",
    image: appScreenshot1,
    decorations: [
      { src: cloud2, className: "absolute -left-20 top-10 w-32 opacity-70 cloud-float" },
      { src: cloud3, className: "absolute -right-16 bottom-20 w-28 opacity-60 cloud-float-slow" },
    ],
  },
  {
    title: "Practice with Top Teachers",
    description:
      "Our highly curated library of guided meditations means you'll only ever hear from practitioners we trust.",
    image: appScreenshot2,
    decorations: [
      { src: balloon1, className: "absolute -left-12 top-0 w-16 cloud-float-fast" },
      { src: balloon2, className: "absolute -right-8 top-20 w-12 cloud-float" },
      { src: balloon3, className: "absolute left-20 -bottom-8 w-14 cloud-float-slow" },
    ],
  },
  {
    title: "A Place for Serious Seekers",
    description:
      "Explore thought-provoking conversations and lessons on life's most important questions—free from religious dogma.",
    image: appScreenshot3,
    decorations: [
      { src: girlOnDock, className: "absolute -left-32 bottom-0 w-48 opacity-90" },
      { src: cloud4, className: "absolute -right-20 top-10 w-24 opacity-60 cloud-float" },
    ],
  },
  {
    title: "Daily Mindfulness Reminder",
    description:
      "Every day, receive a short audio message designed to help bring your meditation practice into your life.",
    image: momentPlayer,
    decorations: [
      { src: cloud2, className: "absolute -right-24 top-0 w-36 opacity-50 cloud-float" },
    ],
  },
];

const AppShowcaseSection = () => {
  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-32">
        {showcaseItems.map((item, index) => (
          <div
            key={index}
            className={`relative flex flex-col ${
              index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
            } items-center gap-12`}
          >
            {/* Decorations */}
            {item.decorations.map((dec, i) => (
              <img
                key={i}
                src={dec.src}
                alt=""
                className={dec.className + " pointer-events-none hidden lg:block"}
              />
            ))}

            {/* Image */}
            <div className="flex-shrink-0 fade-in-up">
              <img
                src={item.image}
                alt={item.title}
                className="w-64 md:w-72 rounded-3xl shadow-2xl"
              />
            </div>

            {/* Text */}
            <div className="text-center lg:text-left max-w-md fade-in-up">
              <h3 className="text-foreground text-2xl md:text-3xl font-serif leading-snug">
                {item.title}
              </h3>
              <p className="text-foreground/80 mt-4 text-lg leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AppShowcaseSection;
