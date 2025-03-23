"use client";

import React from 'react';
import DailyTasks from '../DashComponents/DailyTasks';
import Calendar from '../DashComponents/Calendar';
import PekaButton from '../components/PekaButton';
import Sidebar from '../DashComponents/Sidebar';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left spacer */}
      <div className="w-[240px] hidden xl:block" />
      
      {/* Fixed sidebar */}
      <div className="fixed left-1/2 -translate-x-1/2 xl:translate-x-0 xl:left-0 top-0 bottom-0 z-50">
        <Sidebar />
      </div>

      {/* Main content that fills available space */}
      <main className="flex-1 min-w-0">
        <div className="w-full h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-8 animate-fadeIn relative" style={{animationDelay: "0.1s"}}>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <div className="absolute right-8 top-8 z-50">
              <PekaButton fixed={false} />
            </div>
          </div>

          {/* Main Grid */}
          <div className="px-8 grid grid-cols-1 xl:grid-cols-[1fr,600px] gap-6">
            {/* Tasks Section */}
            <div className="animate-fadeIn" style={{animationDelay: "0.2s"}}>
              <DailyTasks />
            </div>

            {/* Calendar Section */}
            <div className="animate-fadeIn" style={{animationDelay: "0.3s"}}>
              <Calendar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}