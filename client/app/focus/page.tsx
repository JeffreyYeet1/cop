"use client";
import React from "react";
import Sidebar from "../DashComponents/Sidebar";
import PomodoroTimer from '../DashComponents/PomodoroTimer';

export default function FocusPage() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-100">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-white to-violet-100 animate-gradient-slow"></div>
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-md border-r border-violet-100 z-20">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="ml-64 p-8 min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 transform transition-all duration-1000 hover:scale-105">Focus Mode</h1>
            <p className="text-gray-600 transform transition-all duration-1000 hover:text-violet-600">Stay focused and boost your productivity</p>
          </div>

          {/* Timer */}
          <div>
            <PomodoroTimer />
          </div>
        </div>
      </div>
    </div>
  );
}