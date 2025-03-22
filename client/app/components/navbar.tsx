"use client";

import { useState } from "react";
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
  LucideIcon
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
};


const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary rounded-md p-1 flex items-center justify-center h-8 w-8">
              <span className="text-primary-foreground font-bold">AX</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Clash of Plans</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
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
                  <div className="bg-primary rounded-md p-1 flex items-center justify-center h-8 w-8">
                    <span className="text-primary-foreground font-bold">AX</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight">Clash of Plans</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-6">
              {/* Mobile Navigation */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
                <Link
                  href="/about"
                  className="text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                </Button>
                <Button className="w-full justify-start" asChild>
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
