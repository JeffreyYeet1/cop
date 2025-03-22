"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowRight, Check } from "lucide-react";

const HeroSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Email submitted:", email);
  };

  return (
    <div className="relative overflow-hidden bg-background min-h-[calc(100vh-4rem)]">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 blur-3xl opacity-70">
        <div className="aspect-square h-[40rem] rounded-full bg-primary/20"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 blur-3xl opacity-70">
        <div className="aspect-square h-[30rem] rounded-full bg-primary/20"></div>
      </div>

      <div className="container relative h-full flex items-center justify-center py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                <span className="font-medium">New Features Released</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                A better way to <span className="text-primary">build products</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Empower your team with our intuitive platform. Build, launch, and scale your
                products faster than ever before.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-2 flex justify-center">
              <Button type="submit" size="lg">
                Get started
              </Button>
            </form>

            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background"
                    style={{
                      backgroundImage: `url(https://source.unsplash.com/random/100x100?face&sig=${i})`,
                      backgroundSize: 'cover'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
