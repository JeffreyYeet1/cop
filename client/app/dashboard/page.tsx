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
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-mono">⌘O</kbd>
              <span>to talk to Peka</span>
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