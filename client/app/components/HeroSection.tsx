"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowRight, Check, Calendar, ListTodo, Clock, ChevronDown } from "lucide-react";

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(true);
  
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-white min-h-[calc(100vh-4rem)] flex items-center justify-center">
      {/* Background decorations - subtler */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 blur-3xl opacity-50">
        <div className="aspect-square h-[40rem] rounded-full bg-[#BCE7FD]/10"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 blur-3xl opacity-50">
        <div className="aspect-square h-[30rem] rounded-full bg-[#A594F9]/10"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center max-w-3xl mx-auto mt-20">
          <div className="w-full text-center space-y-12">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-5 py-2 text-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
                <span className="flex h-2 w-2 rounded-full bg-[#7EB2FF]"></span>
                <span className="font-medium text-[#4A5568] hover-link">Organize your life with ease</span>
              </div>
              
              <div className="flex justify-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl inline-block hover-link">Clash of</h1>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl inline-block gradient-text animate-explosion" style={{ animationDelay: '300ms' }}>Plans</h1>
              </div>
              
              <p className="text-lg text-[#4A5568] max-w-xl mx-auto no-hover-effect" style={{ lineHeight: '1.7' }}>
                Your all-in-one productivity solution that helps you organize tasks, manage your time, and achieve your goals with a beautiful, simple interface.
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex flex-col items-center group">
                <div className="rounded-full bg-neutral-100 p-4 mb-3 transition-all duration-500 group-hover:bg-[#BCE7FD]/50 group-hover:shadow-md">
                  <ListTodo className="h-5 w-5 text-[#7EB2FF]" />
                </div>
                <p className="text-sm font-medium text-[#4A5568] feature-card-text">Task Management</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="rounded-full bg-neutral-100 p-4 mb-3 transition-all duration-500 group-hover:bg-[#BCE7FD]/50 group-hover:shadow-md">
                  <Calendar className="h-5 w-5 text-[#7EB2FF]" />
                </div>
                <p className="text-sm font-medium text-[#4A5568] feature-card-text">Calendar Integration</p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="rounded-full bg-neutral-100 p-4 mb-3 transition-all duration-500 group-hover:bg-[#BCE7FD]/50 group-hover:shadow-md">
                  <Clock className="h-5 w-5 text-[#7EB2FF]" />
                </div>
                <p className="text-sm font-medium text-[#4A5568] feature-card-text">Time Tracking</p>
              </div>
            </div>

            <div className="flex justify-center items-center animate-fade-in" style={{ animationDelay: '600ms' }}>
              <Button 
                size="lg" 
                className="transition-all duration-500 hover:scale-105 px-10 py-6 bg-gradient-to-r from-[#7EB2FF] to-[#A594F9] text-white border-0 shadow-md hover:shadow-lg text-base" 
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
          
          {showScrollButton && (
            <div 
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-[#4A5568]/70 scroll-down-button cursor-pointer z-10 transition-opacity duration-500"
              onClick={scrollToFeatures}
            >
              <span className="text-sm mb-2">Explore more</span>
              <ChevronDown className="h-6 w-6 animate-bounce" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
