"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoImage from "../../assets/logo.png";
import { useRouter } from 'next/navigation';

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
  LogOut
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
};

const NavBar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user is logged in by looking for the token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300 ${
      scrolled 
        ? "bg-background/95 supports-[backdrop-filter]:bg-background/60 shadow-sm" 
        : "bg-background/50 supports-[backdrop-filter]:bg-background/20"
    }`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 transition-opacity duration-500" style={{ opacity: mounted ? 1 : 0 }}>
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
            <div className="h-8 w-8 relative">
              <Image 
                src={LogoImage} 
                alt="Clash of Plans Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">COP</span>
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="transition-colors hover:bg-violet-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="transition-colors hover:bg-violet-50" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" className="transition-transform hover:scale-105 bg-violet-600 hover:bg-violet-700" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 relative">
                    <Image 
                      src={LogoImage} 
                      alt="Clash of Plans Logo" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold text-xl tracking-tight">COP</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-6">
              {/* Mobile Navigation */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
                <Link
                  href="/about"
                  className="text-sm transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                {isLoggedIn ? (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start transition-colors hover:bg-primary/10"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full justify-start transition-colors hover:bg-primary/10" asChild>
                      <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                    </Button>
                    <Button className="w-full justify-start transition-transform hover:scale-105 bg-violet-600 hover:bg-violet-700" asChild>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>Sign up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default NavBar;
