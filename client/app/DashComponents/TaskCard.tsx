"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, Trash2, Pencil, Check, GripVertical, X } from "lucide-react";
import { todoService } from '../services/todoService';
import { Task } from '../types';

export type Priority = 'low' | 'medium' | 'high';

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'low':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-600',
        border: 'border-sky-200',
        hover: 'hover:bg-sky-100 hover:border-sky-300'
      };
    case 'medium':
      return {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-200',
        hover: 'hover:bg-violet-100 hover:border-violet-300'
      };
    case 'high':
      return {
        bg: 'bg-violet-100',
        text: 'text-violet-700',
        border: 'border-violet-300',
        hover: 'hover:bg-violet-200 hover:border-violet-400'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-100 hover:border-gray-300'
      };
  }
};

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  time?: string;
  priority: Priority;
  onDelete: () => void;
  onUpdate: (updatedTodo: Task) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: number) => void;
  style?: React.CSSProperties;
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  time,
  priority,
  onDelete,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
  style
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description || '');
  const [editedPriority, setEditedPriority] = useState(priority);
  const cardRef = useRef<HTMLDivElement>(null);

  const priorityColors = getPriorityColor(priority);

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  const handleUpdate = async () => {
    try {
      const updatedTodo = await todoService.updateTodo(id, {
        title: editedTitle,
        description: editedDescription,
        priority: editedPriority,
        estimated_duration: time ? parseInt(time.replace('min', '')) : 30
      });
      onUpdate(updatedTodo);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative border p-4 rounded-xl animate-fadeIn shadow-sm ${priorityColors.bg} ${priorityColors.border} ${priorityColors.hover} hover:-translate-y-1 transition-all duration-300 group`}
      draggable={onDragStart !== undefined}
      onDragStart={(e) => onDragStart && onDragStart(e, id)}
      onDragOver={(e) => onDragOver && onDragOver(e)}
      onDrop={(e) => onDrop && onDrop(e, id)}
      style={{
        transform: 'scale(1)',
        transformOrigin: 'center',
        ...style
      }}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-3 py-2 mb-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 transition-all duration-200"
            autoFocus
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full px-3 py-2 mb-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 transition-all duration-200"
            rows={2}
          />
          <select
            value={editedPriority}
            onChange={(e) => setEditedPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1 flex-1"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Drag handle and priority indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleComplete}
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                  isCompleted 
                    ? 'bg-blue-500 border-blue-500 scale-105' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {isCompleted && <Check size={12} className="text-white animate-fadeIn" />}
              </button>
              <h3
                className={`font-medium text-gray-900 text-lg hover:text-blue-600 transition-all duration-200 ${isCompleted ? 'line-through text-gray-400' : ''}`}
              >
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 border transform hover:scale-105 ${priorityColors.text} ${priorityColors.border}`}>
                {priority}
              </span>
              {time && (
                <span className="bg-gray-50 text-gray-600 px-2.5 py-1 text-xs rounded-full flex items-center gap-1 border border-gray-200 transition-all duration-300 transform hover:scale-105">
                  <Clock size={12} /> {time}
                </span>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-500 transition-all duration-300 p-1.5 hover:bg-blue-50 rounded-lg transform hover:scale-110"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 transition-all duration-300 p-1.5 hover:bg-red-50 rounded-lg transform hover:scale-110"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className={`text-gray-600 text-sm mb-2 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
              {description}
            </p>
          )}

          {/* Drag handle */}
          {onDragStart && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-125 hover:rotate-12">
              <GripVertical size={16} className="text-gray-400" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskCard;
