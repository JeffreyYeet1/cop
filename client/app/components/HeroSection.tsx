"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowRight, Check } from "lucide-react";

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-muted/30 min-h-[calc(100vh-4rem)]">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 blur-3xl opacity-70">
        <div className="aspect-square h-[40rem] rounded-full bg-primary/20"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 blur-3xl opacity-70">
        <div className="aspect-square h-[30rem] rounded-full bg-primary/20"></div>
      </div>

      <div className="container relative h-full flex items-center justify-center py-20">
        <div className="w-full max-w-3xl mx-auto text-center transition-opacity duration-500" style={{ opacity: mounted ? 1 : 0 }}>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                <span className="font-medium">New Features Released</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl gradient-text text-center">
                A better way to <span className="text-primary">build products</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground mx-auto max-w-2xl text-center">
                Empower your team with our intuitive platform. Build, launch, and scale your
                products faster than ever before.
              </p>
            </div>
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button size="lg" className="transition-transform hover:scale-105 px-8" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
