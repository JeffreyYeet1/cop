"use client";
import React from "react";
import Sidebar from "../DashComponents/Sidebar";
import PomodoroTimer from "../DashComponents/PomodoroTimer.tsx";

export default function FocusPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Focus Mode</h1>
          <PomodoroTimer />
        </div>
      </main>
    </div>
  );
}