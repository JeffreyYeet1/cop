'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

type Position = 'bottom-left' | 'top-right' | 'top-left';

interface PekaButtonProps {
  position?: Position;
  fixed?: boolean;
}

const positionClasses = {
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

const PekaButton: React.FC<PekaButtonProps> = ({ position = 'top-right', fixed = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`${fixed ? 'fixed' : ''} ${fixed ? positionClasses[position] : ''} z-40`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm transition-all duration-300 ${
          isHovered ? 'opacity-70 border-gray-300 shadow-md' : 'opacity-100'
        }`}
      >
        <span className="text-gray-500 text-sm">Press</span>
        <span className="bg-gray-50 text-gray-800 font-mono font-medium rounded px-1.5 py-0.5 text-sm border border-gray-200">⌘O</span>
        <span className="text-gray-500 text-sm">to talk to Peka</span>
      </div>
    </div>
  );
};

export default PekaButton; 