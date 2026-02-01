import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TestimonialSection from "@/components/TestimonialSection";
import FeaturesSection from "@/components/FeaturesSection";
import AppShowcaseSection from "@/components/AppShowcaseSection";
import TeachersSection from "@/components/TeachersSection";
import ReviewsSection from "@/components/ReviewsSection";
import CTASection from "@/components/CTASection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-sky-gradient">
      <Header />
      <main>
        <HeroSection />
        <TestimonialSection />
        <FeaturesSection />
        <AppShowcaseSection />
        <TeachersSection />
        <ReviewsSection />
        <CTASection />
        <FooterSection />
      </main>
    </div>
  );
};

export default Index;
