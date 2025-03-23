"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Focus, Calendar, Settings, LogOut, Sparkles } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [username, setUsername] = useState("User");

  // Simulate getting username
  useEffect(() => {
    // In a real app, this would fetch from an API or auth system
    setTimeout(() => {
      setUsername("Alex Johnson");
    }, 1000);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Focus', path: '/focus', icon: Focus },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="h-full bg-sky-500/60 backdrop-blur-md text-white flex flex-col">
      {/* App Title */}
      <div className="p-6 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <h1 className="text-lg font-semibold text-white">Clash of Plans</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path) 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-medium text-white">{username?.charAt(0) || "U"}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{username}</div>
            <div className="text-xs text-white/70">{username.toLowerCase().replace(' ', '.')}@example.com</div>
          </div>
        </div>
        
        <button className="w-full flex items-center space-x-3 px-4 py-3 mt-2 rounded-xl text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 