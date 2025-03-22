import Image from "next/image";
import NavBar from "./components/navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeatureSection";
import PopImageSection from "./components/PopImageSection";


export default function Home() {
  return (
    <div>
      <NavBar />
      <HeroSection />
      <PopImageSection />
      <FeaturesSection />
    </div>
  );
}
