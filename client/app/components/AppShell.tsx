import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="h-full w-full flex flex-col bg-gray-50 relative overflow-hidden">
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AppShell;