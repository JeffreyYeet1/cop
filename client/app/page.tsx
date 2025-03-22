import Image from "next/image";
import NavBar from "./components/navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeatureSection";


export default function Home() {
  return (
    <div>
      <NavBar />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
