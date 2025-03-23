"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Focus, Calendar, Settings, LogOut, Sparkles, User2 } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState("User");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get user info from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setUsername(userInfo.name || "User");
        setEmail(userInfo.email || "user@example.com");
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
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

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    
    // Redirect to home page
    router.push('/');
  };

  return (
    <div className="h-full bg-sky-500/75 backdrop-blur-md text-white flex flex-col animate-fadeIn">
      {/* App Title */}
      <div className="p-6 mb-4 animate-fadeIn" style={{animationDelay: "0.1s"}}>
        <div className="flex items-center space-x-2 group cursor-pointer">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse transition-transform duration-500 group-hover:scale-150"></div>
          <h1 className="text-lg font-semibold transition-all duration-300 group-hover:translate-x-1">Clash of Plans</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 animate-fadeIn" style={{animationDelay: "0.2s"}}>
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            href={item.path}
            className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10 ${
              pathname === item.path
                ? 'bg-white/20 text-white translate-x-1'
                : 'text-white/90 hover:bg-white/10 hover:translate-x-1'
            }`}
            style={{animationDelay: `${0.2 + index * 0.05}s`}}
          >
            <item.icon size={18} className="transition-all duration-300 group-hover:scale-125" />
            <span className="transition-all duration-300 group-hover:font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 animate-fadeIn" style={{animationDelay: "0.4s"}}>
        <div className="border-t border-white/10 pt-4">
          <div className="group flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <User2 size={16} className="text-white transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div className="flex-1 transition-all duration-300 group-hover:translate-x-0.5">
              <div className="text-sm font-medium transition-all duration-300 group-hover:text-white">{username}</div>
              <div className="text-xs text-white/80 transition-all duration-300 group-hover:text-white/90">{email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group w-full mt-2 px-4 py-2.5 rounded-xl text-left text-sm text-white/90 hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10 flex items-center space-x-2"
          >
            <LogOut size={16} className="transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
            <span className="transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};  

export default Sidebar; 