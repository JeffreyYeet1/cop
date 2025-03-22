"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Zap,
  LineChart,
  Shield,
  Workflow,
  Users,
  CheckCircle,
  Star,
  Clock,
  Calendar,
  Bell,
  Target
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
  }
];

const FeaturesSection = () => {
  const [visibleSection, setVisibleSection] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleSection(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="features-section" ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col items-center text-center mb-20 max-w-3xl mx-auto animate-slide-up ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-[#FF6B35] mb-6">
            <span className="hover-link">Features</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 no-hover-effect">
            Everything you need to succeed
          </h2>
          <p className="text-[#734F35] max-w-2xl mx-auto no-hover-effect" style={{ lineHeight: '1.8' }}>
            Our productivity platform provides all the tools you need to organize your life,
            stay focused, and achieve your goals—all in one beautiful interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg border border-neutral-100 bg-white p-8 transition-all hover:shadow-md transform hover:-translate-y-2 hover:border-neutral-200 duration-500 animate-slide-up ${!visibleSection ? 'opacity-0' : ''}`}
              style={{ animationDelay: `${200 + (index * 150)}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-[#FF6B35] transition-all duration-500 group-hover:bg-[#FFECCC]/20">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-xl font-semibold gradient-text hover-link">{feature.title}</h3>
              <p className="mt-3 text-[#734F35] feature-card-text">{feature.description}</p>

              {/* Decorative background element */}
              <div className="absolute right-0 bottom-0 opacity-[0.02]">
                {feature.icon && (
                  <div className="h-28 w-28 text-[#FF6B35] transform rotate-6">
                    {feature.icon}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-24 rounded-2xl bg-gradient-to-br from-white to-neutral-50 border border-neutral-100 p-10 lg:p-12 max-w-6xl mx-auto animate-slide-up ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '800ms' }}>
          <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="text-2xl font-bold mb-5 no-hover-effect">Why choose our platform?</h3>
              <p className="text-[#734F35] no-hover-effect" style={{ lineHeight: '1.8' }}>
                We've built our solution with your productivity needs in mind. From students to professionals,
                our platform adapts to your workflow and helps you accomplish more with less stress.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-8">
                <div className={`animate-fade-in ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '900ms' }}>
                  <p className="text-3xl font-bold text-[#FF6B35] hover-link">30%</p>
                  <p className="text-sm text-[#734F35] feature-card-text">Productivity boost</p>
                </div>
                <div className={`animate-fade-in ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '1000ms' }}>
                  <p className="text-3xl font-bold text-[#FF6B35] hover-link">25+</p>
                  <p className="text-sm text-[#734F35] feature-card-text">App integrations</p>
                </div>
                <div className={`animate-fade-in ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '1100ms' }}>
                  <p className="text-3xl font-bold text-[#FF6B35] hover-link">99.9%</p>
                  <p className="text-sm text-[#734F35] feature-card-text">Uptime reliability</p>
                </div>
                <div className={`animate-fade-in ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '1200ms' }}>
                  <p className="text-3xl font-bold text-[#FF6B35] hover-link">24/7</p>
                  <p className="text-sm text-[#734F35] feature-card-text">Customer support</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className={`relative h-[320px] w-full rounded-lg overflow-hidden animate-scale-in shadow-sm ${!visibleSection ? 'opacity-0' : ''}`} style={{ animationDelay: '1300ms' }}>
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                  alt="Productivity planning"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 to-[#FFCB77]/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
