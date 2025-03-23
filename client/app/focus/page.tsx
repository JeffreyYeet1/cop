"use client";
import React from "react";
import Sidebar from "../DashComponents/Sidebar";
import PomodoroTimer from '../DashComponents/PomodoroTimer';

export default function FocusPage() {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Full screen gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-50 via-white to-sky-100 animate-gradient z-0" />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 bottom-0 w-[240px] z-20">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-[240px] relative z-10">
        {/* Header */}
        <div className="flex justify-center items-center p-8 animate-fadeIn" style={{animationDelay: "0.1s"}}>
          <h1 className="text-4xl font-bold text-gray-900">Focus Mode</h1>
        </div>

        {/* Focus Timer Container */}
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="w-full max-w-3xl mx-auto px-8">
            <PomodoroTimer />
          </div>
        </div>
      </main>
    </div>
  );
}