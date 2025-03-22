"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Menu,
  ChevronDown,
  Globe,
  LifeBuoy,
  Blocks,
  Lightbulb,
  Users,
  BookOpen,
  School,
  LucideIcon,
  Calendar,
  LayoutDashboard,
  Settings
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
};

const navItems: NavItem[] = [
  {
    title: "Features",
    href: "/features",
    icon: LayoutDashboard
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: Calendar
  },
  {
    title: "About",
    href: "/about",
    icon: Users
  },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300 ${
      scrolled 
        ? "bg-white supports-[backdrop-filter]:bg-white/90 shadow-sm border-neutral-100" 
        : "bg-transparent border-transparent"
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 transition-all duration-500 hover:scale-105 animate-fade-in group">
            <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF9F1C] rounded-md p-1 flex items-center justify-center h-8 w-auto px-2 transform transition-transform group-hover:rotate-6">
              <span className="text-white font-bold">COP</span>
            </div>
            <span className=" font-bold text-xl tracking-tight gradient-text hover-link">Clash of Plans</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center justify-center animate-fade-in" style={{ animationDelay: '100ms' }}>
            {navItems.map((item, index) => (
              <Link 
                key={index}
                href={item.href} 
                className="text-sm font-medium text-[#734F35] hover-link"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center justify-center translate-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#734F35] hover:text-[#FF6B35] transition-all duration-500 hover:bg-[#FFECCC]/50 animate-fade-in hover-link" 
              style={{ animationDelay: '200ms' }} 
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center translate-y-2">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF9F1C] text-white border-0 shadow-sm transition-all duration-500 hover:shadow-md hover:scale-105 animate-fade-in" 
              style={{ animationDelay: '300ms' }} 
              asChild
            >
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden animate-fade-in text-[#734F35] hover:bg-[#FFECCC]/50">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white border-l border-neutral-100">
            <SheetHeader>
              <SheetTitle className="text-[#734F35]">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF9F1C] rounded-md p-1 flex items-center justify-center h-8 w-auto px-2">
                    <span className="text-white font-bold">COP</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight gradient-text">Clash of Plans</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-6">
              {/* Mobile Navigation */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-[#734F35]/70">Navigation</h3>
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-sm text-[#734F35] flex items-center gap-2 hover:text-[#FF6B35] transition-colors hover-link"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.title}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-neutral-100 text-[#734F35] hover:bg-[#FFECCC]/30 transition-colors"  
                  asChild
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                </Button>
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-[#FF6B35] to-[#FF9F1C] text-white border-0 transition-all hover:shadow-md" 
                  asChild
                >
                  <Link href="/signup" onClick={() => setIsOpen(false)}>Sign up</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default NavBar;
