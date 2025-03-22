"use client";
import React from "react";
import DailyTasks from "../DashComponents/DailyTasks";
import Sidebar from "../DashComponents/Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <DailyTasks />
      </main>
    </div>
  );
}