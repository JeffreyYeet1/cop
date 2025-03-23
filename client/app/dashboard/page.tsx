"use client";

import React from 'react';
import DailyTasks from '../DashComponents/DailyTasks';
import Calendar from '../DashComponents/Calendar';
import PekaButton from '../components/PekaButton';
import Sidebar from '../DashComponents/Sidebar';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 w-[240px]">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-[240px]">
        {/* Header */}
        <div className="flex justify-between items-center p-8 animate-fadeIn" style={{animationDelay: "0.1s"}}>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="group px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 hover:border-sky-100">
              <div className="text-sm text-gray-500 flex items-center space-x-2 group-hover:translate-x-0.5 transition-all duration-500">
                <span className="group-hover:text-gray-600 transition-colors duration-300">Press</span>
                <kbd className="px-2 py-1 bg-white rounded-md text-sky-500 font-mono shadow-sm border border-sky-100 group-hover:scale-110 transition-all duration-300">⌘O</kbd>
                <span className="group-hover:text-gray-600 transition-colors duration-300">to talk to Peka</span>
              </div>
            </div>
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
      </main>
    </div>
  );
}