import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import WorkoutTypes from "@/components/sections/WorkoutTypes";
import Trainers from "@/components/sections/Trainers";
import BentoGrid from "@/components/sections/BentoGrid";
import LogoCloud from "@/components/sections/LogoCloud";
import CallToAction from "@/components/sections/CallToAction";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <WorkoutTypes />
      <Trainers />
      <BentoGrid />
      <LogoCloud />
      <CallToAction />
    </>
  );
}
