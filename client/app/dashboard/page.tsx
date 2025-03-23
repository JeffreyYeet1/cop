"use client";
import React from "react";
import DailyTasks from "../DashComponents/DailyTasks";
import Sidebar from "../DashComponents/Sidebar";
import Calendar from "../DashComponents/Calendar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden pt-0">
          <div className="w-[55%] pl-4">
            <DailyTasks />
          </div>
          <div className="w-[45%] pr-0 pt-0">
            <Calendar />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}