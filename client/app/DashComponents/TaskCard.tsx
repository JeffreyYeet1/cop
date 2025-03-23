"use client";

import { useState } from "react";
import { Clock, X, Plus } from "lucide-react";

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
  onDelete?: () => void;
  onTasksChange?: (tasks: Task[]) => void;
}

const TaskCard = ({ title, time, tasks: initialTasks, tag, onDelete, onTasksChange }: CardProps) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newSubtask, setNewSubtask] = useState('');

  const toggleTask = (id: number) => {
    const newTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
    onTasksChange?.(newTasks);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      const newTask: Task = {
        id: Date.now(),
        title: newSubtask.trim(),
        completed: false
      };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      onTasksChange?.(newTasks);
      setNewSubtask('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md w-72 space-y-3 border relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {time && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded flex items-center gap-1">
              <Clock size={12} /> {time}
            </span>
          )}
          <button 
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete task"
          >
            <X size={16} />
          </button>
        </div>
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

      {/* Add Subtask Form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="text-blue-500 hover:text-blue-600"
          disabled={!newSubtask.trim()}
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Footer */}
      {tag && <div className="text-blue-500 text-sm font-medium">#{tag}</div>}
    </div>
  );
};

export default TaskCard;
