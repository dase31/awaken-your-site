import cloud1 from "@/assets/cloud-1.png";
import cloud2 from "@/assets/cloud-2.png";
import cloud4 from "@/assets/cloud-4.png";
import bird1 from "@/assets/bird-1.png";
import bird2 from "@/assets/bird-2.png";

export function OnboardingBackground() {
  return (
    <>
      {/* Floating clouds */}
      <img
        src={cloud1}
        alt=""
        className="absolute top-16 right-10 w-48 opacity-70 cloud-float pointer-events-none"
      />
      <img
        src={cloud2}
        alt=""
        className="absolute top-32 left-10 w-40 opacity-60 cloud-float-slow pointer-events-none"
      />
      <img
        src={cloud4}
        alt=""
        className="absolute bottom-24 left-16 w-32 opacity-50 cloud-float-fast pointer-events-none"
      />
      <img
        src={cloud4}
        alt=""
        className="absolute bottom-32 right-20 w-36 opacity-40 cloud-float pointer-events-none"
      />

      {/* Flying birds */}
      <img
        src={bird1}
        alt=""
        className="absolute top-24 left-[25%] w-6 bird-fly pointer-events-none opacity-70"
      />
      <img
        src={bird2}
        alt=""
        className="absolute top-40 right-[30%] w-5 bird-fly pointer-events-none opacity-60"
        style={{ animationDelay: "3s" }}
      />
    </>
  );
}
