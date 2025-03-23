"use client";
import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import LogoImage from "../../assets/logo.png";
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Coffee, 
  Calendar, 
  ClipboardList, 
  Power, 
  Pencil,
  CalendarRange,
  MonitorSmartphone,
  ChevronDown,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    router.push('/login');
  };

  return (
    <div className="w-64 h-screen bg-white border-r p-6 flex flex-col">
      {/* Company Name with Dropdown */}
      <div className="relative">
        <button 
          className="flex items-center gap-2 mb-8 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
           <div className="h-8 w-8 relative">
            <Image 
              src={LogoImage} 
              alt="Clash of Plans Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <span className="text-xl font-semibold text-gray-700">Clash of Plans</span>
          <ChevronDown size={20} className="text-gray-500" />
        </button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-10 left-0 w-48 bg-white rounded-md shadow-lg z-10 border">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg ${
            pathname === '/dashboard' ? 'bg-gray-100' : 'hover:bg-gray-100'
          }`}
        >
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link 
          href="/focus" 
          className={`flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg ${
            pathname === '/focus' ? 'bg-gray-100' : 'hover:bg-gray-100'
          }`}
        >
          <Coffee size={20} />
          <span>Focus</span>
        </Link>
      </nav>
    </div>
  );
};  

export default Sidebar; 