'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import PekaLoading from './PekaLoading';

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
  const [isLoading, setIsLoading] = useState(false);

  const handlePekaClick = () => {
    setIsLoading(true);
    // Simulate Peka loading - replace with actual Peka logic
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  return (
    <>
      <button
        className={`group ${
          fixed ? 'fixed bottom-8 right-8' : ''
        } px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 relative`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePekaClick}
      >
        {/* Rainbow gradient border - made thicker and more vibrant */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-sky-500 to-violet-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-rotate" />
        
        {/* Inner white border for contrast */}
        <div className="absolute -inset-[1px] bg-white rounded-xl" />
        
        {/* Content */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2">
          <div className="text-sm text-gray-500 flex items-center space-x-2 group-hover:translate-x-0.5 transition-all duration-500">
            <span className="group-hover:text-gray-600 transition-colors duration-300">Press</span>
            <kbd className="px-2 py-1 bg-white rounded-md text-sky-500 font-mono shadow-sm border border-sky-100 group-hover:scale-110 transition-all duration-300">⌘O</kbd>
            <span className="group-hover:text-gray-600 transition-colors duration-300">to talk to Peka</span>
          </div>
        </div>
      </button>

      <PekaLoading isLoading={isLoading} />
    </>
  );
};

export default PekaButton; 