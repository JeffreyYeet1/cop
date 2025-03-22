"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface CardProps {
  title: string;
  time?: string;
  tasks: Task[];
  tag?: string;
}

const TaskCard = ({ title, time, tasks: initialTasks, tag }: CardProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md w-72 space-y-3 border">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        {time && (
          <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded flex items-center gap-1">
            <Clock size={12} /> {time}
          </span>
        )}
      </div>

      {/* Task List with Checkboxes */}
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)}
              className="w-4 h-4 accent-gray-500 cursor-pointer"
            />
            <span className={task.completed ? "line-through text-gray-400" : "text-gray-700"}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      {tag && <div className="text-blue-500 text-sm font-medium">#{tag}</div>}
    </div>
  );
};

export default TaskCard;
