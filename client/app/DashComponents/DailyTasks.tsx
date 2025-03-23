"use client";

import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

interface Task {
  title: string;
  description?: string;  // New optional description
  priority: 'low' | 'medium' | 'high';  // New priority field
  estimatedTime: string;  // Renamed from time
  tasks: { id: number; title: string; completed: boolean; }[];
}

const DailyTasks = () => {
  const date = new Date();
  const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleString('en-US', { month: 'long', day: 'numeric' });

  // Convert tasks to state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [newTaskTime, setNewTaskTime] = useState('');

  const handleAddTask = () => {
    setShowModal(true);
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask = {
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      priority: newTaskPriority,
      estimatedTime: newTaskTime,
      tasks: [],
    };

    setTasks([...tasks, newTask]);
    setShowModal(false);
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('low');
    setNewTaskTime('');
  };

  const handleDeleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTasksChange = (index: number, newSubtasks: { id: number; title: string; completed: boolean; }[]) => {
    setTasks(tasks.map((task, i) => 
      i === index ? { ...task, tasks: newSubtasks } : task
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{dayName}</h1>
        <p className="text-xl text-gray-500">{monthDay}</p>
      </div>

      {/* Add Task Button */}
      <div className="mb-6">
        <button 
          onClick={handleAddTask}
          className="w-72 bg-white p-4 rounded-2xl shadow-md border flex items-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Plus size={20} className="text-gray-400" />
          <span className="text-gray-600">Add task</span>
        </button>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <TaskCard
            key={index}
            title={task.title}
            description={task.description}
            priority={task.priority}
            estimatedTime={task.estimatedTime}
            tasks={task.tasks}
                onDelete={() => handleDeleteTask(index)}
            onTasksChange={(newTasks) => handleTasksChange(index, newTasks)}
          />
        ))}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 isolate">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-2xl p-6 w-96 pointer-events-auto">
              <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
              <form onSubmit={handleSubmitTask}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full border rounded-lg p-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full border rounded-lg p-2"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority *
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full border rounded-lg p-2"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="w-full border rounded-lg p-2"
                      placeholder="e.g. 0:30"
                    />
                  </div>    
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTasks;