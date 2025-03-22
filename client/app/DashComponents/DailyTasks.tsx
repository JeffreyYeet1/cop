"use client";

import React from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const DailyTasks = () => {
  const date = new Date();
  const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleString('en-US', { month: 'long', day: 'numeric' });

  const tasks = [
    {
      title: "Answer customer support tickets",
      time: "0:30",
      tasks: [{ id: 1, title: "Answer customer support tickets", completed: false }],
      tag: "growth"
    },
    {
      title: "Document customer feedback",
      time: "1:30",
      tasks: [
        { id: 1, title: "Summarize customer churn surveys", completed: true },
        { id: 2, title: "Review top posts in Canny", completed: true }
      ],
      tag: "product"
    },
    {
      title: "Investigate secondary growth channels",
      time: "0:30",
      tasks: [{ id: 1, title: "Investigate secondary growth channels", completed: false }],
      tag: "growth"
    },
    {
      title: "Review prototype of new feature",
      time: "2:00",
      tasks: [{ id: 1, title: "Review prototype of new feature", completed: false }],
      tag: "product"
    },
    {
      title: "1:1 with Tomoa",
      time: "0:30",
      tasks: [{ id: 1, title: "1:1 with Tomoa", completed: false }],
      tag: "growth"
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{dayName}</h1>
        <p className="text-xl text-gray-500">{monthDay}</p>
      </div>

      {/* Add Task Button */}
      <div className="mb-6">
        <button className="w-72 bg-white p-4 rounded-2xl shadow-md border flex items-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors">
          <Plus size={20} className="text-gray-400" />
          <span className="text-gray-600">Add task</span>
          <span className="ml-auto bg-gray-100 px-2 py-1 rounded text-sm">7:00</span>
        </button>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <TaskCard
            key={index}
            title={task.title}
            time={task.time}
            tasks={task.tasks}
            tag={task.tag}
          />
        ))}
      </div>
    </div>
  );
};

export default DailyTasks;