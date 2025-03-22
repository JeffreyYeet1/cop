"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const PopImageSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
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
      className="relative w-full h-[100vh] overflow-hidden"
    >
      <div 
        className="absolute inset-0 transition-transform duration-100 ease-out"
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
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Your Vision, Our Innovation</h2>
            <p className="text-xl opacity-90">Transform your ideas into reality</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopImageSection;