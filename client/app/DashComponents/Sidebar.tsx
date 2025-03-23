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
    <aside className="w-56 bg-gray-900 text-white h-screen p-4 flex flex-col shadow-xl overflow-hidden">
      <div className="mb-8 mt-3">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 hover:text-blue-400 transition-all duration-300 transform hover:translate-x-1">
          <Sparkles size={18} className="text-blue-400 animate-pulse-soft" />
          <span>Clash of Plans</span>
        </h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:translate-x-1 ${
                  isActive(item.path) 
                    ? 'bg-blue-600 shadow-lg shadow-blue-600/20 text-white font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon size={18} className={`transition-transform duration-300 ${isActive(item.path) ? 'animate-pulse-soft' : 'group-hover:scale-110'}`} />
                <span>{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto mb-4">
        <Link 
          href="/logout"
          className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white rounded-lg transition-all duration-300 hover:bg-red-500/20 hover:text-red-300 transform hover:translate-x-1"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Link>
      </div>
      
      <div className="flex items-center p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:translate-y-[-2px]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold">
          {username?.charAt(0) || "U"}
        </div>
        <div className="ml-3 overflow-hidden">
          <p className="text-sm font-medium truncate">{username}</p>
          <p className="text-xs text-gray-400 truncate">{username.toLowerCase().replace(' ', '.')}@example.com</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 