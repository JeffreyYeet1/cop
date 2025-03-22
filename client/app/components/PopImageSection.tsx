"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const PopImageSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in effect on load
    setOpacity(1);

    // Fade in effect on load
    setOpacity(1);

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, 1 - (rect.top + rect.height) / (window.innerHeight + rect.height)));
      
      // Scale from 1 to 0.9 as you scroll
      const newScale = 0.95 - (scrollProgress * 0.1);

      setScale(newScale);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative w-full h-[90vh] overflow-hidden flex items-center justify-center"
    >
      <div 
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <Image
          src="/image.png"
          alt="Productivity Planning"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/80 to-white">
        {/* Content removed as requested */}
      </div>
    </div>
  );
};

export default PopImageSection;