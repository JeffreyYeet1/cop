import React from 'react';

interface PekaLoadingProps {
  isLoading: boolean;
}

const PekaLoading: React.FC<PekaLoadingProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[200] animate-fadeIn">
      <div className="relative">
        {/* Rainbow loading ring */}
        <div className="w-32 h-32 rounded-full relative animate-spin-slow">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-sky-500 to-violet-500 animate-gradient-rotate" 
               style={{ 
                 maskImage: 'linear-gradient(transparent 35%, black 65%)',
                 WebkitMaskImage: 'linear-gradient(transparent 35%, black 65%)'
               }} 
          />
        </div>
        
        {/* Inner content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-semibold bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent animate-pulse">
                Peka
              </div>
              <div className="text-xs text-gray-500 mt-1">thinking...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PekaLoading; 