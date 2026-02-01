import jackKornfield from "@/assets/teachers/jack-kornfield.jpg";
import josephGoldstein from "@/assets/teachers/joseph-goldstein.jpg";
import henryShukman from "@/assets/teachers/henry-shukman.jpg";
import laurieSantos from "@/assets/teachers/laurie-santos.jpg";
import dianaWinston from "@/assets/teachers/diana-winston.jpg";
import davidWhyte from "@/assets/teachers/david-whyte.jpg";
import mingyurRinpoche from "@/assets/teachers/mingyur-rinpoche.jpg";
import gangaji from "@/assets/teachers/gangaji.jpg";
import nikkiMirghafori from "@/assets/teachers/nikki-mirghafori.jpg";
import adyashanti from "@/assets/teachers/adyashanti.jpg";

const teachers = [
  { name: "Jack Kornfield", image: jackKornfield },
  { name: "Joseph Goldstein", image: josephGoldstein },
  { name: "Henry Shukman", image: henryShukman },
  { name: "Laurie Santos", image: laurieSantos },
  { name: "Diana Winston", image: dianaWinston },
  { name: "David Whyte", image: davidWhyte },
  { name: "Mingyur Rinpoche", image: mingyurRinpoche },
  { name: "Gangaji", image: gangaji },
  { name: "Nikki Mirghafori", image: nikkiMirghafori },
  { name: "Adyashanti", image: adyashanti },
];

const TeachersSection = () => {
  // Duplicate for seamless scroll
  const allTeachers = [...teachers, ...teachers];

  return (
    <section className="py-20 overflow-hidden">
      <h2 className="text-foreground text-3xl md:text-4xl font-serif text-center mb-12 px-6">
        World-Renowned Teachers and Scholars
      </h2>

      <div className="relative">
        <div className="flex scroll-marquee">
          {allTeachers.map((teacher, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-4 text-center"
            >
              <img
                src={teacher.image}
                alt={teacher.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg mx-auto"
              />
              <p className="text-foreground mt-4 font-medium">{teacher.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
