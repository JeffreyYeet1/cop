"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Clock,
  Calendar,
  Bell,
  Target,
  Users,
  Zap,
  LineChart,
  Shield,
  Workflow,
  ArrowUp
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "Task Management",
    description: "Create, organize, and prioritize your tasks with intuitive drag-and-drop interface and customizable tags.",
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    title: "Focus Timers",
    description: "Boost productivity with built-in Pomodoro timers and focus sessions to help you stay on track.",
    icon: <Clock className="h-5 w-5" />
  },
  {
    title: "Calendar Integration",
    description: "Synchronize with your favorite calendar apps to keep all your schedules in one place.",
    icon: <Calendar className="h-5 w-5" />
  },
  {
    title: "Smart Notifications",
    description: "Get reminders at the right time with AI-powered notifications that adapt to your behavior.",
    icon: <Bell className="h-5 w-5" />
  },
  {
    title: "Habit Tracking",
    description: "Build consistent habits with visual progress trackers and streak counters to maintain momentum.",
    icon: <Target className="h-5 w-5" />
  },
  {
    title: "Team Collaboration",
    description: "Share projects, assign tasks, and collaborate seamlessly with teammates in real-time.",
    icon: <Users className="h-5 w-5" />
  },
  {
    title: "Scalable Architecture",
    description: "As your business grows, our platform grows with you, handling increasing loads with ease.",
    icon: <ArrowUp className="h-5 w-5" />
  }
];

const FeaturesSection = () => {
  const [visibleSection, setVisibleSection] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Memoize features to prevent unnecessary re-renders
  const memoizedFeatures = useMemo(() => features, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleSection(true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'  // Add rootMargin for earlier triggering
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="features-section" 
      ref={sectionRef} 
      className="py-24 relative overflow-hidden"
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Animated gradient background */}
      <div className="animated-gradient-background"></div>
      
      {/* Enhanced decorative elements with larger gradients */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#7EB2FF]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-[#A594F9]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#BCE7FD]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div 
          className={`flex flex-col items-center text-center mb-20 max-w-3xl mx-auto animate-slide-up ${!visibleSection ? 'opacity-0' : ''}`}
          style={{ 
            animationDelay: '100ms',
            willChange: 'transform, opacity'
          }}
        >
          <div className="inline-flex items-center justify-center rounded-full bg-[#BCE7FD]/20 px-4 py-1.5 text-sm font-medium text-[#7EB2FF] mb-6 backdrop-blur-sm badge-pill">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#7EB2FF] mr-2"></span>
            <span>Student Solutions</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#4A5568] to-[#7EB2FF] hover-scale">
            Turn Chaos into Clarity
          </h2>
          <p className="text-[#4A5568] max-w-2xl mx-auto leading-relaxed hover-bright">
            Stop struggling with missed deadlines and overwhelming schedules. Our platform helps you
            take control of your academic life with powerful tools designed specifically for students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {memoizedFeatures.map((feature, index) => (
            <div
              key={feature.title}  // Use title as key instead of index
              className={`feature-card relative overflow-hidden rounded-xl border border-neutral-100 p-8 gradient-blur animate-slide-up ${!visibleSection ? 'opacity-0' : ''}`}
              style={{ 
                animationDelay: `${200 + (index * 100)}ms`,
                willChange: 'transform, opacity, background'
              }}
            >
              <div className="feature-card-icon flex h-12 w-12 items-center justify-center rounded-full bg-[#BCE7FD]/20 text-[#7EB2FF]">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#4A5568] to-[#7EB2FF] hover-bright">
                {feature.title}
              </h3>
              <p className="mt-3 text-[#4A5568] leading-relaxed">
                {feature.description}
              </p>

              <div className="absolute right-0 bottom-0 opacity-[0.02] feature-card-bg-icon">
                {feature.icon && (
                  <div className="h-32 w-32 transform rotate-12">
                    {feature.icon}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div 
          className={`mt-24 rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 border border-[#E2E8F0]/50 p-10 lg:p-16 max-w-6xl mx-auto animate-slide-up backdrop-blur-xl shadow-xl hover-glow ${!visibleSection ? 'opacity-0' : ''}`}
          style={{ 
            animationDelay: '800ms',
            willChange: 'transform, opacity'
          }}
        >
          <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#BCE7FD]/20 px-4 py-1.5 text-sm font-medium text-[#7EB2FF] badge-pill">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[#7EB2FF]"></span>
                  <span>Why Students Love Us</span>
                </div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4A5568] to-[#7EB2FF] hover-scale">
                  Level Up Your Study Game
                </h3>
                <p className="text-[#4A5568] leading-relaxed hover-bright">
                  Join thousands of students who've transformed their academic life with our platform. 
                  From better grades to more free time, we're helping students worldwide achieve their goals 
                  while maintaining a healthy study-life balance.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className={`stat-card group animate-fade-in rounded-xl p-4 ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '900ms' }}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7EB2FF] to-[#A594F9] stat-number">86</span>
                    <span className="text-2xl font-bold text-[#7EB2FF] stat-number">%</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#4A5568] group-hover:text-[#7EB2FF] transition-colors">
                    Students Feel Overwhelmed
                  </p>
                </div>

                <div className={`stat-card group animate-fade-in rounded-xl p-4 ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '1000ms' }}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7EB2FF] to-[#A594F9] stat-number">45</span>
                    <span className="text-2xl font-bold text-[#7EB2FF] stat-number">%</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#4A5568] group-hover:text-[#7EB2FF] transition-colors">
                    Miss Assignment Deadlines
                  </p>
                </div>

                <div className={`stat-card group animate-fade-in rounded-xl p-4 ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '1100ms' }}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7EB2FF] to-[#A594F9] stat-number">3.5</span>
                    <span className="text-2xl font-bold text-[#7EB2FF] stat-number">hr</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#4A5568] group-hover:text-[#7EB2FF] transition-colors">
                    Daily Time Wasted
                  </p>
                </div>

                <div className={`stat-card group animate-fade-in rounded-xl p-4 ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '1200ms' }}>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7EB2FF] to-[#A594F9] stat-number">70</span>
                    <span className="text-2xl font-bold text-[#7EB2FF] stat-number">%</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#4A5568] group-hover:text-[#7EB2FF] transition-colors">
                    Report Poor Time Management
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm text-[#4A5568]/80 italic hover-bright">
                  Based on recent studies from the National Center for Education Statistics and student surveys
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className={`relative h-[400px] w-full rounded-2xl overflow-hidden animate-scale-in shadow-xl hover-lift ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '1300ms' }}>
                <Image
                  src="/student-illustration.svg"
                  alt="Student struggling with time management"
                  fill
                  className="object-contain p-4 hover-bright"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#7EB2FF]/5 to-[#A594F9]/5 backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
