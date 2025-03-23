// app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Brain, ArrowRight } from 'lucide-react';
import NavBar from './components/navbar';
import PopImageSection from './components/PopImageSection';
import AdditionalFeatures from './components/AddtionalFeatures';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="w-full">
        <NavBar />
      </nav>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">Clash of Plans</h1>
          
          <div className="mb-10">
            <div className="flex justify-center mb-6">
              <Brain size={48} className="text-blue-500" />
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Your intelligent productivity companion that uses AI to optimize your schedule, 
              resolve conflicts between tasks, and help you achieve more with less stress.
            </p>
            <p className="text-lg text-gray-600">
              Clash of Plans analyzes your commitments, priorities, and available time to create 
              the perfect balance between productivity and well-being.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link 
              href={isLoggedIn ? "/dashboard" : "/signup"} 
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <Calendar size={20} />
              <span>{isLoggedIn ? "Go to Dashboard" : "Get Started"}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <PopImageSection />
      <AdditionalFeatures />
      
      <footer className="w-full py-8 text-center text-gray-500 bg-white">
        <p>© {new Date().getFullYear()} Clash of Plans. All rights reserved.</p>
      </footer>
    </div>
  );
}