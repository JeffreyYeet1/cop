"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Zap,
  LineChart,
  Shield,
  Workflow,
  Users,
  AArrowUp
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "Lightning Fast Performance",
    description: "Our platform is built for speed, with sub-100ms response times and optimized workflows.",
    icon: <Zap className="h-5 w-5" />
  },
  {
    title: "Real-Time Analytics",
    description: "Get instant insights into your business metrics with customizable dashboards and reports.",
    icon: <LineChart className="h-5 w-5" />
  },
  {
    title: "Enterprise-Grade Security",
    description: "Your data is protected with end-to-end encryption, SSO, and compliance with industry standards.",
    icon: <Shield className="h-5 w-5" />
  },
  {
    title: "Automated Workflows",
    description: "Streamline your processes with powerful automation tools that save time and reduce errors.",
    icon: <Workflow className="h-5 w-5" />
  },
  {
    title: "Team Collaboration",
    description: "Work together seamlessly with built-in commenting, sharing, and notification features.",
    icon: <Users className="h-5 w-5" />
  },
  {
    title: "Scalable Architecture",
    description: "As your business grows, our platform grows with you, handling increasing loads with ease.",
    icon: <AArrowUp className="h-5 w-5" />
  }
];

const FeaturesSection = () => {
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100 && rect.bottom > 0) {
        // When section is in view, gradually show items
        const newVisibleItems = [...visibleItems];
        for (let i = 0; i < features.length; i++) {
          if (!newVisibleItems.includes(i)) {
            setTimeout(() => {
              setVisibleItems(prev => [...prev, i]);
            }, i * 150);
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleItems.length]);

  return (
    <section ref={sectionRef} className="py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto transition-opacity duration-500" style={{ opacity: mounted ? 1 : 0 }}>
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-5">
            Everything you need to succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform provides all the tools and features you need to build,
            launch, and grow your business, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border bg-background p-6 transition-all hover:shadow-md transform hover:-translate-y-1 duration-300"
              style={{ 
                opacity: visibleItems.includes(index) ? 1 : 0,
                transform: `translateY(${visibleItems.includes(index) ? '0' : '20px'})`,
                transition: 'opacity 0.5s ease, transform 0.5s ease'
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>

              {/* Decorative background element */}
              <div className="absolute right-0 bottom-0 opacity-5">
                {feature.icon && (
                  <div className="h-24 w-24 text-primary transform rotate-12">
                    {feature.icon}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-muted/50 border p-8 lg:p-10 max-w-6xl mx-auto transition-opacity duration-500" style={{ 
          opacity: mounted ? 1 : 0,
          transitionDelay: '300ms'
        }}>
          <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-3">Why choose our platform?</h3>
              <p className="text-muted-foreground">
                We've built our solution with your business needs in mind. From startups to enterprise companies,
                our platform scales to meet you where you are and helps take you where you want to go.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime reliability</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">Customer support</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">150+</p>
                  <p className="text-sm text-muted-foreground">Integrations</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">30%</p>
                  <p className="text-sm text-muted-foreground">Average time saved</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                  alt="Team collaboration"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-primary/10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
