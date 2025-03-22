"use client";
import React from "react";
import DailyTasks from "../dashcomponents/DailyTasks";
import Sidebar from "../dashcomponents/Sidebar";
import Calendar from "../dashcomponents/Calendar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex">
        <div className="flex-1">
          <DailyTasks />
        </div>
        <Calendar />
      </main>
    </div>
  );
}