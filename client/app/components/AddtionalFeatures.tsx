"use client";

import Image from "next/image";

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="mb-4 p-3 rounded-full bg-blue-50">
        <img
          src={icon}
          alt={`${title} icon`}
          width={48}
          height={48}
          className="w-12 h-12"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function AdditionalFeatures() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
          Designed for the way you work
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="/images/ai-scheduling.svg"
            title="AI-Powered Scheduling"
            description="Smart algorithms help you prioritize and schedule your tasks efficiently."
          />

          <FeatureCard
            icon="/images/focus-mode.svg"
            title="Focus Mode"
            description="Hyperfocus on your most important task without distractions."
          />

          <FeatureCard
            icon="/images/calendar-sync.svg"
            title="Calendar Sync"
            description="Seamlessly sync with all your calendars across different platforms."
          />

          <FeatureCard
            icon="/images/weekly-review.svg"
            title="Weekly Review and Planning"
            description="Be intentional about your weekly goals and track your progress."
          />

          <FeatureCard
            icon="/images/keyboard-shortcuts.svg"
            title="Keyboard Shortcuts"
            description="Move faster and do everything with your keyboard for maximum efficiency."
          />

          <FeatureCard
            icon="/images/analytics.svg"
            title="Analytics"
            description="Understand how you spend your time and improve your productivity."
          />
        </div>
      </div>
    </section>
  );
}
