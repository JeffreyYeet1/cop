"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';
import { Plus, X, Loader2 } from 'lucide-react';
import { todoService } from '../services/todoService';
import { Task, Priority } from '../types';

const NewTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; description: string; priority: Priority; estimated_duration: number }) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'low' as Priority,
    estimated_duration: 30
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newTask);
    setNewTask({
      title: '',
      description: '',
      priority: 'low',
      estimated_duration: 30
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
      <div 
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-xl transform transition-all duration-300 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Create New Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (min)
              </label>
              <input
                type="number"
                value={newTask.estimated_duration}
                onChange={(e) => setNewTask({ ...newTask, estimated_duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all duration-200"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

const DailyTasks = () => {
  const [todos, setTodos] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const date = new Date();
  const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleString('en-US', { month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await todoService.getAllTodos();
        setTodos(data);
      } catch (err) {
        setError('Failed to fetch todos');
        console.error('Error fetching todos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const handleAddTodo = async (taskData: { title: string; description: string; priority: Priority; estimated_duration: number }) => {
    try {
      const newTodo = await todoService.createTodo(taskData);
      setTodos([...todos, newTodo]);
      setShowNewTaskModal(false);
    } catch (err) {
      console.error('Error creating todo:', err);
      setError('Failed to create todo');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo');
    }
  };

  const handleUpdateTodo = async (updatedTodo: Task) => {
    try {
      setTodos(todos.map(todo => 
        todo.id === updatedTodo.id ? updatedTodo : todo
      ));
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    e.dataTransfer.setData('text/plain', id.toString());
    e.currentTarget.classList.add('opacity-70', 'scale-105', 'rotate-1');
    e.currentTarget.classList.remove('animate-fadeIn');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggingElement = document.querySelector('.opacity-70');
    if (draggingElement) {
      const dropTarget = e.currentTarget as HTMLElement;
      if (dropTarget === draggingElement) return;
      
      dropTarget.classList.add('drag-indicator');
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-70', 'scale-105', 'rotate-1');
    e.currentTarget.classList.add('animate-fadeIn');
    document.querySelectorAll('.drag-indicator').forEach(el => {
      el.classList.remove('drag-indicator');
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
    if (draggedId === targetId) return;

    const draggedIndex = todos.findIndex(todo => todo.id === draggedId);
    const targetIndex = todos.findIndex(todo => todo.id === targetId);
    
    const newTodos = [...todos];
    const [draggedTodo] = newTodos.splice(draggedIndex, 1);
    newTodos.splice(targetIndex, 0, draggedTodo);
    
    setTodos(newTodos);
    handleDragEnd(e);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`p-5 min-h-full bg-white ${showNewTaskModal ? 'blur-sm' : ''} transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Todo</h2>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Add Task</span>
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fadeIn" style={{animationDelay: "0.3s"}}>
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3 transform hover:scale-110 transition-all duration-300">
              <Plus size={20} className="text-blue-500" />
            </div>
            <div className="text-gray-500 mb-3 text-center">
              No tasks for today. Click "Add Task" to add one!
            </div>
            <button 
              onClick={() => setShowNewTaskModal(true)}
              className="text-blue-500 hover:text-blue-600 font-medium transition-all duration-300 transform hover:-translate-y-1"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo, index) => (
              <TaskCard
                key={todo.id}
                id={todo.id}
                title={todo.title}
                description={todo.description}
                time={`${todo.estimated_duration}min`}
                priority={todo.priority as Priority}
                onDelete={() => handleDeleteTodo(todo.id)}
                onUpdate={handleUpdateTodo}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{animationDelay: `${0.3 + index * 0.08}s`}}
              />
            ))}
          </div>
        )}
      </div>

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSubmit={handleAddTodo}
      />
    </>
  );
};

export default DailyTasks;