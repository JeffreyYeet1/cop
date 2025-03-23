"use client";

import Link from "next/link";
import Image from "next/image";
import LogoImage from "../../assets/logo.png";

const BaseNavBar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
          <div className="h-8 w-8 relative">
            <Image 
              src={LogoImage} 
              alt="Clash of Plans Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <span className="font-bold text-xl tracking-tight">Clash of Plans</span>
        </Link>
      </div>
    </header>
  );
};

export default BaseNavBar;
