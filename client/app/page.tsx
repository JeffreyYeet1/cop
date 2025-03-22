import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamic imports
const NavBar = dynamic(() => import("./components/navbar"), { ssr: true });
const HeroSection = dynamic(() => import("./components/HeroSection"), { ssr: true });
const FeaturesSection = dynamic(() => import("./components/FeatureSection"), { ssr: true });
const PopImageSection = dynamic(() => import("./components/PopImageSection"), { ssr: true });

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      <NavBar />
      <main className="w-full">
        <HeroSection />
        <PopImageSection />
        <FeaturesSection />
      </main>
    </div>
  );
}
