"use client";

import { useState } from "react";
import { Clock, Trash2, Pencil } from "lucide-react";
import { todoService } from '../services/todoService';
import { Todo } from '../types/todo';

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  onDelete: () => void;
  onUpdate: (todo: Todo) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TaskCard = ({ id, title, description, time, priority, onDelete, onUpdate }: TaskCardProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ title, description, priority });

  const handleToggleComplete = async () => {
    try {
      setIsCompleted(!isCompleted);
      await todoService.updateTodo(id, {
        title,
        description,
        priority,
        estimated_duration: parseInt(time.replace('min', ''))
      });
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      await todoService.updateTodo(id, {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        estimated_duration: parseInt(time.replace('min', ''))
      });
      onUpdate({ id, title: editedTask.title, description: editedTask.description, priority: editedTask.priority, estimated_duration: parseInt(time.replace('min', '')), user_id: 0, created_at: '' });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  return (
    <div className={`bg-white p-4 rounded-2xl shadow-md w-full border transition-all duration-200 ${isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggleComplete}
          className="mt-1 w-5 h-5 accent-blue-500 cursor-pointer"
        />
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full px-2 py-1 border rounded"
              />
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full px-2 py-1 border rounded"
                rows={2}
              />
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="px-2 py-1 border rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(priority)}`}>
                    {priority}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded flex items-center gap-1">
                    <Clock size={12} /> {time}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className={`mt-2 text-gray-600 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                {description}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
