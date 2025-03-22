"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  const [visibleSection, setVisibleSection] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleSection(true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden"
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Animated gradient background */}
      <div className="animated-gradient-background"></div>
      
      {/* Enhanced decorative elements with larger gradients */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#7EB2FF]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#A594F9]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#BCE7FD]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Title with enhanced animation */}
          <div className="flex justify-center mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="inline-block animate-explosion bg-clip-text text-transparent bg-gradient-to-r from-[#4A5568] to-[#7EB2FF]">
                Clash of Plans
              </span>
            </h1>
          </div>

          {/* Tagline with improved animation */}
          <div className="mb-12">
            <p className="text-xl sm:text-2xl text-[#4A5568] max-w-2xl mx-auto leading-relaxed no-hover-effect">
              Organize your life with ease
            </p>
          </div>

          {/* Feature icons with enhanced layout */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#7EB2FF]"></div>
              <span className="text-[#4A5568]">Task Management</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#A594F9]"></div>
              <span className="text-[#4A5568]">Focus Timers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#BCE7FD]"></div>
              <span className="text-[#4A5568]">Calendar Sync</span>
            </div>
          </div>

          {/* CTA Button with improved hover effect */}
          <div className="mb-16">
            <Link href="/signup">
              <button className="px-8 py-4 bg-gradient-to-r from-[#7EB2FF] to-[#A594F9] text-white rounded-full text-lg font-medium hover-lift hover-bright transition-all duration-1000">
                Get Started
              </button>
            </Link>
          </div>

          {/* Scroll down indicator with enhanced animation */}
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer scroll-down-button"
            onClick={scrollToFeatures}
            style={{ willChange: 'transform' }}
          >
            <span className="text-sm text-[#4A5568]">Explore more</span>
            <ChevronDown className="h-6 w-6 text-[#7EB2FF]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
