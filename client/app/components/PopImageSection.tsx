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

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, 1 - (rect.top + rect.height) / (window.innerHeight + rect.height)));
      
      // Scale from 1 to 0.8 as you scroll
      const newScale = 0.9 - (scrollProgress * 0.2);

      setScale(newScale);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative w-full h-[100vh] overflow-hidden flex items-center justify-center"
    >
      <div 
        className="absolute inset-0 transition-all duration-100 ease-out"
        style={{
          transform: `scale(${scale})`,
        }}
      >
        <Image
          src="/image.png"
          alt="Demo Image"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background">
        <div className="container h-full flex items-center justify-center">
          {/* Empty content - removed as requested */}
        </div>
      </div>
    </div>
  );
};

export default PopImageSection;